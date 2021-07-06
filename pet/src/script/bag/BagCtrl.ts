
import { HttpManager,HttpName,HttpMethod } from "../../manager/HttpManager";
import { Test } from "../Test";
import { Struct_MinRank } from "../../custom/config/Struct";
import { BagData } from "./BagData";

/*
* 2021-06-15 andy
    背包控制
*/
export class BagCtrl{

    private static _ins:BagCtrl;
    public static get ins():BagCtrl{
		if(!this._ins)
		BagCtrl._ins=new BagCtrl();
		return this._ins;
	}
	constructor(){
		if(BagCtrl._ins != null)
			throw new Error("BagCtrl is single!");
	}

	public init():void{
       
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
            case HttpName.user:
                if(method == HttpMethod.GET){
                    BagData.ins.initEquip(e);
                }else{
                    BagData.ins.saveEquip(e);
                }
                break;
            case HttpName.bag:
                BagData.ins.initBag(e);
                break;
            case HttpName.save_equip:
                
                break;
            case HttpName.get_product:
                BagData.ins.getProduct(e);
                break;
            default:
                console.log("未定义http消息"+msg);
                break;
        }
    }

}
