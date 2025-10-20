package com.appdev.xyz.gakog5.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.appdev.xyz.gakog5.annotation.RequireAdminAuth;
import com.appdev.xyz.gakog5.annotation.RequireAuth;
import com.appdev.xyz.gakog5.entity.auth.Session;
import com.appdev.xyz.gakog5.entity.user.Admin;
import com.appdev.xyz.gakog5.entity.user.UserRole;
import com.appdev.xyz.gakog5.service.auth.SessionService;
import com.appdev.xyz.gakog5.service.user.AdminService;

@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    private final SessionService sessionService;
    private final AdminService adminService;
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequireAuth requireAuth = handlerMethod.getMethodAnnotation(RequireAuth.class);
        RequireAdminAuth requireAdminAuth = handlerMethod.getMethodAnnotation(RequireAdminAuth.class);

        // If neither annotation is present, allow
        if (requireAuth == null && requireAdminAuth == null) {
            return true;
        }

        // Extract token from Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"message\": \"Missing or invalid authorization header\"}");
            return false;
        }

        String token = authHeader.substring(7);

        try {
            Session session = sessionService.validateAccessToken(token);
            if (!session.isActive()) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"message\": \"Session is inactive\"}");
                return false;
            }

            request.setAttribute("currentUser", session.getUser());
            request.setAttribute("currentSession", session);

            if (requireAdminAuth != null) {
                if (session.getUser().getRole() != UserRole.ADMIN) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\"message\": \"Admin privileges required\"}");
                    return false;
                }else{
                    Admin admin = adminService.findAdminByUser(session.getUser());
                    request.setAttribute("currentAdmin", admin);
                }
            }

            return true;
        } catch (IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"message\": \"" + e.getMessage() + "\"}");
            return false;
        }
    }

}