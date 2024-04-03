class ResponseFormat {
    constructor(result=null, type=null, errorCode=null, message=null) {
        this.result={}
        if(result!=null){
            this.result = result;
        }
        this.type = type;
        this.errorDetails = {"errorCode":  errorCode, "message": message}
    }
}


module.exports = ResponseFormat;