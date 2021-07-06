import { UserData } from "../script/user/UserData";
import { CustomDefine, Environment } from "../custom/CustomDefine";
import { Test } from "../script/Test";
import { GameCtrl } from "../script/GameCtrl";
import { AppCtrl } from "../script/AppCtrl";
import { MsgCtrl } from "../script/MsgCtrl";

export class HttpMethod {
    static POST: string = "post";
    static PUT: string = "put";
    static GET: string = "get";
}
/*
* 2021-05-27 andy
网络访问
*/
export class HttpManager {
    /** App传入token */
    public token: string = "";
    /** App传入uid */
    public uid: string = "";

    public keyHeaders: any[];

    private static _ins: HttpManager;
    public static get ins(): HttpManager {
        if (!this._ins)
            HttpManager._ins = new HttpManager();
        return this._ins;
    }
    constructor() {
        if (HttpManager._ins != null)
            throw new Error("HttpManager is single!");
    }

    public init(): void {
        if (Test.ins.isDebug) {
            console.log("调试环境");
            //手机测试号 15649868888
            this.token= "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNDExNjE5MzY0Mjk3MjY5MjQ4In0.eLRHb-NLqAAzfrH0Aw1UeJ3W1Pwu760-hXYs8naKnK5vnxWYkhQ8wXS2UreYzDW9Ns8xNcaZ304n_NGGcfFcmDQQfV5RGpxzcguor9COlkzWtrAj5ML8L_12mZO8DC5YBVs03Zxq3Q0gj4kItObNzXgbHSyMViaxkbAP7-dVdcM";
            this.uid = "1411619364297269248";

            // this.token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMzI3OTcwMjc5MjEyNzE2MDMyIn0.oakqIcl3XGbMITlbVwWDDNVaxB8TGBjGlW_T0b_-EmNryWvpSvlurRbbDhgJoEE9Of2omVVhaHEaKQDvRq0_YCY244F3EoSPxCHR-ZurN-0Asn2inXLNREzV-pxOPVCUMoJCtoDLWPzabb4m_l1GKFlLUHkICYNV2VI3_TwfwEs";
            // this.uid = "1327970279212716032";
            AppCtrl.ins.type = "1";
            Define.CDN = "res/";//"http://dev.newpet.toowow.cn:8808/pet/res/";
            Define.serverHttp = "http://dev.api.toowow.cn:30008";
            UserData.ins.head = "game/head.png";
            UserData.ins.sex = 0;
            UserData.ins.name = "Andy";"奥里给";
            UserData.ins.gold = 100000;
        } else {
            console.log("APP环境");

            //2021-06-10 andy 按环境配置
            if (CustomDefine.environment == Environment.RELEASE) {
                //http://prod.newpet.toowow.cn
                Define.CDN = "http://prod.static-webgame.toowow.cn";
                Define.serverHttp = "https://api.toowow.cn";
            } else if (CustomDefine.environment == Environment.PRE) {
                //http://pre.newpet.toowow.cn
                Define.CDN = "res/",//"http://pre.static-webgame.toowow.cn";
                    Define.serverHttp = "http://pre.api.toowow.cn";
            } else if (CustomDefine.environment == Environment.TEST) {
                //http://test.newpet.toowow.cn:30010
                Define.CDN = "res/";//"http://dev.newpet.toowow.cn:8808/pet/res/";
                Define.serverHttp = "http://test.api.toowow.cn:30010";
            } else {
                //http://dev.newpet.toowow.cn:30009
                Define.CDN = "http://dev.newpet.toowow.cn:8808/pet/res/";
                Define.serverHttp = "http://dev.api.toowow.cn:30008";

            }

        }
        console.log("res cdn:", Define.CDN,"server:",Define.serverHttp);

        this.keyHeaders = [
            "Content-Type", "application/json;charset=utf8;",
            "token", this.token
        ];//"X-Requested-With","XMLHttpRequest",
    }

    public sendMsg(msg: string, data?: any, method: string = HttpMethod.GET, callBack: Function = null): void {
        var xhr: Laya.HttpRequest = new Laya.HttpRequest();
        xhr.http.timeout = 10000;//设置超时时间；
        xhr.once(Laya.Event.COMPLETE, this, callBack, [msg, method]);
        xhr.once(Laya.Event.ERROR, this, this.onError, [msg, method]);

        if (method == HttpMethod.GET) {
            let param: string = "";
            if (data) {
                for (let key of Object.keys(data)) {
                    param += key + "=" + data[key];
                }
            }
            msg += "?" + param;
        }
        data = JSON.stringify(data);
        xhr.send(Define.serverHttp + msg, data, method, "json", this.keyHeaders);
    }

    private onError(msg: string, e): void {
        console.log("http消息失败！" + msg + ",json=" + JSON.stringify(e));
        EventManager.ins.event(CustomDefine.HTTP_SEND_ERROR,msg);
        /**
         * 用户断网或弱网加载失败：网络居然崩溃了，别紧张刷新试试（刷新）
             用户断网或弱网，与服务器断开且重连失败：矿洞有点拥挤，先去外面转转（确定）
             服务器网络负载极限或崩溃：矿洞太火爆了，请稍后再试（确定）
         * 
         */
        //2021-06-28 andy 如果是在拉取门票报错，则刷新webview重试
        if(msg == HttpName.TICKETINFO){
            AppCtrl.ins.loadError();
        }else{
            MsgCtrl.ins.showMsg("矿洞太火爆了，请稍后再试", "确   定", () => {
                //AppCtrl.ins.close();
                
            })
        }
        
    }

    public getQueryVariable(variable): string {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) { return pair[1]; }
        }
        return "";
    }


}


export class HttpName {
    //-------andy------
    static token: string = "/account/v2/white/login/password";
    static bag: string = "/pet/v2/backpack";
    static user: string = "/pet/v2/user";
    static save_equip: string = "/pet/v2/user";
    static get_product: string = "/pet/v2/spu";
    /** 挖矿排行 */
    static get_minrank: string = "/mining/v2/white/leaderboard";
    /** 挖矿记录 */
    static get_minrecord: string = "/mining/v2/reward";



    //2021-06-22 测试
    /** 统计数据*/
    static mine_addup: string = "/mining/v2/white/mine/add_up";


    static ASSIGN: string = "/mining/v2/white/assign";
    static MININIT: string = "/mining/v2/white/mine/init";
    static BUYTICKET: string = "/mining/v2/ticket";











    //矿洞信息
    static MININFO: string = "/mining/v2/info";
    //挖矿行为
    static MINBEHAVIOUR: string = "/mining/v2/mining";
    //门票信息
    static TICKETINFO: string = "/mining/v2/white/ticket";

}