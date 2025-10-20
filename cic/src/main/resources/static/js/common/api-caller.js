class ApiCaller{
    constructor(){
        this.auth = new Auth();
        this.allowSpinner = true;
        console.log("Api called instantiated");
    }

    setAllowSpinner(allow){
        this.allowSpinner = allow;
    }
    async postRequest(url, data, requireAuth = false, loadingText = 'Processing...'){
        if(this.allowSpinner) window.LoadingOverlay.show(loadingText);

        const headers = requireAuth ? this.auth.getAuthHeaders() : {
            'Content-Type': 'application/json'
        }

        try{
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            })
            const jsonData = await response.json();
            
            return {
                ...jsonData, // message, data
                success: response.ok,
                status: response.status
            }
        }catch(e){
            return {success: false, error: e.message}
        }finally{
            window.LoadingOverlay.hide();
        }
    }

    async getRequest(url, requireAuth = false, loadingText = 'Loading...'){
        window.LoadingOverlay.show(loadingText);
         const headers = requireAuth ? this.auth.getAuthHeaders() : {
            'Content-Type': 'application/json'
        };

        try{
            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
            })
            const jsonData = await response.json();
            
            return {
                ...jsonData, 
                success: response.ok,
                status: response.status
            }
        }catch(e){
            return {success: false, error: e.message};
        }finally{
            window.LoadingOverlay.hide();
        }
    }
}

window.ApiCaller = new ApiCaller();