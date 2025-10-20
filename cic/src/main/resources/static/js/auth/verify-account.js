document.addEventListener('DOMContentLoaded', () => {
    const btnVerify = document.getElementById('btn_verify');
    const nameElement = document.getElementById('name');
    const emailElement = document.getElementById('email');
    const statusElement = document.getElementById('status');
    const statusContainer = document.getElementById('verification_status');
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    let currentEmail = null;

    window.ApiCaller.postRequest('/auth/verify-status', { token:token }).then(response => {
        if (response.success) {
            nameElement.textContent = response.data.name;
            emailElement.textContent = response.data.email;
            statusElement.textContent = `STATUS: ${String(response.data.state).toUpperCase()}`;
            currentEmail = response.data.email;

            // Update status styling
            statusContainer.className = 'verification-status';
            if (response.data.state === 'Pending') {
                statusContainer.classList.add('status-pending');
            } else if (response.data.state === 'Expired') {
                statusContainer.classList.add('status-expired');
                btnVerify.disabled = true;
            }
        } else {
            console.log(response.data.state);
            nameElement.textContent = response.data.name || 'N/A';
            emailElement.textContent = response.data.email || 'N/A';
            statusElement.textContent = `STATUS: ${String(response.data.state).toUpperCase()}`;
            statusContainer.className = 'verification-status';
            statusContainer.classList.add('status-verified');      
            btnVerify.disabled = true;
        }
    }).catch(error => {
        console.error("Network or server error:", error);
        window.MessageBox.showError("Unable to reach the server. Please try again later.", () => {
            window.MessageBox.hide();
        });
    });

    btnVerify.addEventListener('click', () => {
        window.MessageBox.showConfirm('Are you sure you want to verify account registration?', () => {
            window.ApiCaller.postRequest('/auth/verify-account', { 
                email: currentEmail
            }).then(response => {
                if (response.success) {
                    window.MessageBox.showSuccess('Email has been verified. You can now login.', () => {
                        window.location.href = '/cic/auth/sign-in';
                    });
                } else {
                    window.MessageBox.showError(response.message, () => {
                        window.MessageBox.hide();
                    });
                }
            }).catch(error => {
                console.error("Network or server error:", error);
                window.MessageBox.showError("Unable to reach the server. Please try again later.", () => {
                    window.MessageBox.hide();
                });
            });
        });
    });
});