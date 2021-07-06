import { UserData } from "./UserData";
import { HttpManager,HttpName,HttpMethod } from "../../manager/HttpManager";
import { Test } from "../Test";
import { Struct_MinRank } from "../../custom/config/Struct";
import { BagData } from "../bag/BagData";

/*
* 2021-05-27 andy
网络访问
*/
export class UserCtrl{

    private static _ins:UserCtrl;
    public static get ins():UserCtrl{
		if(!this._ins)
		UserCtrl._ins=new UserCtrl();
		return this._ins;
	}
	constructor(){
		if(UserCtrl._ins != null)
			throw new Error("UserCtrl is single!");
	}

	public init():void{
       
	}

    public getUser():void{
        var data = {
            user_id:HttpManager.ins.uid
        };
        console.log("get user, data="+JSON.stringify(data));
        HttpManager.ins.sendMsg(HttpName.user,data,HttpMethod.GET,this.onComplete);
    }
    public getBag():void{
        var data = {
            user_id:HttpManager.ins.uid
        };
        console.log("lge bag, data="+JSON.stringify(data));
        HttpManager.ins.sendMsg(HttpName.bag,data,HttpMethod.GET,this.onComplete);
    }
    public saveEquip():void{
        var data = {backpack_ids:[],screenshot:""};
        for(let item of BagData.ins.arrEquip){
            data.backpack_ids.push(item.id+"");
        }
        console.log("save euqip, data="+JSON.stringify(data));
        HttpManager.ins.sendMsg(HttpName.save_equip,data,HttpMethod.PUT,this.onComplete);
    }
    public clearEquip(code:string):void{
        var data = {backpack_ids:[]};

        console.log("clear equip, data="+JSON.stringify(data));
        HttpManager.ins.sendMsg(HttpName.save_equip,data,HttpMethod.PUT,this.onComplete);
    }
    public getProduct(src:string):void{
        var data = {
            src:src//encodeURIComponent(src)
        };
        console.log("get product, data="+JSON.stringify(data));
        HttpManager.ins.sendMsg(HttpName.get_product,data,HttpMethod.GET,this.onComplete);
    }

    //------- 挖矿 -------
    /**
     * 获得挖矿记录
     * @param month 月份
     */
     public getMinRecord(month:string=""):void{
        var data = {
            month:month
        };
        console.log("get minrecord, data="+JSON.stringify(data));
        HttpManager.ins.sendMsg(HttpName.get_minrecord,data,HttpMethod.GET,this.onComplete);
    }
    public getMinRank(rankType:number):void{
        var data = {
            day:rankType==1?1:0
        };
        if(rankType==1){
            UserData.ins.arrMinRank1=[];
        }else{
            UserData.ins.arrMinRank2=[];
            UserData.ins.arrMinRank3=[];
        }
        console.log("get minrank, data="+JSON.stringify(data));
        HttpManager.ins.sendMsg(HttpName.get_minrank,data,HttpMethod.GET,this.onComplete);
    }
    
	

	private onComplete(msg:string,method:string,e):void{
        console.log("http消息成功！"+msg+",json="+JSON.stringify(e));
		if(e.code == -1){
			//console.log("服务器返回:",e.msg);
			return;
		}
        switch(msg){
            case HttpName.token:
                console.log(e);
                break;
            case HttpName.get_minrecord:
                UserData.ins.initMinRecord(e);
                break;
            case HttpName.get_minrank:
                UserData.ins.initMinRank(e);
                break;
            default:
                console.log("未定义http消息"+msg);
                break;
        }
    }

}
