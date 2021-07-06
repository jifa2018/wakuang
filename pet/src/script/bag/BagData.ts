import { DataConfig } from "../../custom/config/DataConfig";
import { Cfg_Item, Struct_Bag, Struct_Equip, Struct_MinRank, Struct_MinRecord, Struct_MinRecordPrize } from "../../custom/config/Struct";
import { CustomDefine } from "../../custom/CustomDefine";
/*
* 2021-05-27 andy
	用户背包信息
*/
export class BagData{
	/** 装备数据 */
	public arrEquip:Array<Struct_Equip>;
	/** 背包数据 */
	public arrBag:Array<Struct_Bag>;
	/** 装备名字 */
	public arrEquipName:Array<string>;
	/** 装备骨骼节点 */
	public arrEquipBone:Array<string>;

    private static _ins:BagData;
    public static get ins():BagData{
		if(!this._ins)
		BagData._ins=new BagData();
		return this._ins;
	}
	constructor(){
		if(BagData._ins != null)
			throw new Error("BagData is single!");
		this.arrEquipName = [];
		this.arrEquipName[EQUIP_TYPE.hat]=EQUIP_NAME.hat;
		this.arrEquipName[EQUIP_TYPE.hair]=EQUIP_NAME.hair;
		this.arrEquipName[EQUIP_TYPE.eye]=EQUIP_NAME.eye;
		this.arrEquipName[EQUIP_TYPE.ear]=EQUIP_NAME.ear;
		this.arrEquipName[EQUIP_TYPE.neck]=EQUIP_NAME.neck;
		this.arrEquipName[EQUIP_TYPE.body]=EQUIP_NAME.body;
		this.arrEquipName[EQUIP_TYPE.arm]=EQUIP_NAME.arm;
		this.arrEquipName[EQUIP_TYPE.ring]=EQUIP_NAME.ring;
		this.arrEquipName[EQUIP_TYPE.belt]=EQUIP_NAME.belt;
		this.arrEquipName[EQUIP_TYPE.leg]=EQUIP_NAME.leg;
		this.arrEquipName[EQUIP_TYPE.foot]=EQUIP_NAME.foot;
		this.arrEquipBone=[];
		this.arrEquipBone[EQUIP_TYPE.hat]=EQUIP_BONE.hat;
		this.arrEquipBone[EQUIP_TYPE.hair]=EQUIP_BONE.hair;
		this.arrEquipBone[EQUIP_TYPE.eye]=EQUIP_BONE.eye;
		this.arrEquipBone[EQUIP_TYPE.ear]=EQUIP_BONE.ear;
		this.arrEquipBone[EQUIP_TYPE.neck]=EQUIP_BONE.neck;
		this.arrEquipBone[EQUIP_TYPE.body]=EQUIP_BONE.body;
		this.arrEquipBone[EQUIP_TYPE.arm]=EQUIP_BONE.arm;
		this.arrEquipBone[EQUIP_TYPE.ring]=EQUIP_BONE.ring;
		this.arrEquipBone[EQUIP_TYPE.belt]=EQUIP_BONE.belt;
		this.arrEquipBone[EQUIP_TYPE.leg]=EQUIP_BONE.leg;
		this.arrEquipBone[EQUIP_TYPE.foot]=EQUIP_BONE.foot;
		this.arrEquip=[];
		this.arrBag=[];
	}
	public initEquip(obj:any):void{
		console.log("得到装备穿戴信息：",obj);
		
        let equips:any=obj.data;
		if(equips){
			for(let equip of equips){
				let struct:Struct_Equip=new Struct_Equip();
				struct.id = equip.id;
				struct.itemId = equip.itemId;
				struct.cfg = DataConfig.ins.getItemById(equip.itemId);
				this.arrEquip.push(struct);
			}
		}
        
		EventManager.ins.event(CustomDefine.EVENT_EQUIP);
	}
	public initBag(obj:any):void{
        let bags:any=obj.data;
		if(bags && bags instanceof Array){
			for(let bag of bags){
				let struct:Struct_Bag=new Struct_Bag();
				struct.id = bag.id;
				struct.itemId = bag.itemId;
				struct.cfg = DataConfig.ins.getItemById(bag.itemId);
				this.arrBag.push(struct);
			}
		}
		EventManager.ins.event(CustomDefine.EVENT_BAG);
	}
	public saveEquip(obj:any):void{
		EventManager.ins.event(CustomDefine.EVENT_SAVE_EQUIP,{success:obj.data});
	}
	public getProduct(obj:any):void{
		//id  name  desc
		EventManager.ins.event(CustomDefine.EVENT_GET_PRODUCT,obj.data);
	}

	/** 根据类型获得背包列表 */
	public getBagByType(type:number):Array<Struct_Bag>{
		let arrType:Array<Struct_Bag>=[];
		for(let bag of this.arrBag){
			if(!bag)continue;
			if(type==0 || bag.cfg.type_index == type){
				arrType.push(bag);
			}
		}
		return arrType;
	}
	/** 根据类型获得穿戴装备 */
	public getEquipByType(type:number):Struct_Equip{
		let ret:Struct_Equip=null;
		for(let equip of this.arrEquip){
			if(!equip)continue;
			if(equip.cfg.type == type){
				ret = equip;
				break;
			}
		}
		return ret;
	}
	/**
	 * 获得道具Icon路径
	 * @param id 
	 * @returns 
	 */
	public getIconPath(id:number):string{
		let cfg:Cfg_Item = DataConfig.ins.getItemById(id);
		return Define.CDN+"icon/item_"+cfg.sex+"_"+cfg.type+"_"+cfg.type_index+".png";
	}
	/**
	 * 获得模型资源路径
	 * @param id 
	 * @returns 
	 */
	public getModelPath(id:number):string{
		let cfg:Cfg_Item = DataConfig.ins.getItemById(id);
		return Define.CDN+"3d/user/pet_"+cfg.sex+"_"+cfg.type+"_"+cfg.type_index+".lh";
	}
}

export class EQUIP_TYPE{
	/** 帽子 */
    public static  hat:number = 1;
	/** 发带 */
    public static  hair:number = 2;
	/** 眼镜 */
    public static  eye:number = 3;
	/** 耳饰 */
    public static  ear:number = 4;
	/** 项链 */
    public static  neck:number = 5;
	/** 上衣 */
    public static  body:number = 6;
	/** 手镯 */
    public static  arm:number = 7;
	/** 戒指 */
    public static  ring:number = 8;
	/** 腰带 */
    public static  belt:number = 9;
	/** 裤子*/
    public static  leg:number = 10;
	/** 鞋*/
    public static  foot:number = 11;

}
export class EQUIP_NAME{
	/** 帽子 */
    public static  hat:string = "帽子";
	/** 发带 */
    public static  hair:string = "发带";
	/** 眼镜 */
    public static  eye:string = "眼镜";
	/** 耳饰 */
    public static  ear:string = "耳饰";
	/** 项链 */
    public static  neck:string = "项链";
	/** 上衣 */
    public static  body:string = "上衣";
	/** 手镯 */
    public static  arm:string = "手镯 ";
	/** 戒指 */
    public static  ring:string = "戒指";
	/** 腰带 */
    public static  belt:string = "腰带";
	/** 裤子*/
    public static  leg:string = "裤子";
	/** 鞋*/
    public static  foot:string = "鞋";
}
/** 骨骼节点名字 */
export class EQUIP_BONE{
	/** 帽子 */
    public static  hat:string = "hat_point";
	/** 发带 */
    public static  hair:string = "hair_point";
	/** 眼镜 */
    public static  eye:string = "eye_point";
	/** 耳饰 */
    public static  ear:string = "ear_point";
	/** 项链 */
    public static  neck:string = "neck_point";
	/** 上衣 */
    public static  body:string = "body_point";
	/** 手镯 */
    public static  arm:string = "arm_point";
	/** 戒指 */
    public static  ring:string = "ring_point";
	/** 腰带 */
    public static  belt:string = "belt_point";
	/** 裤子*/
    public static  leg:string = "leg_point";
	/** 鞋*/
    public static  foot:string = "foot_point";
}