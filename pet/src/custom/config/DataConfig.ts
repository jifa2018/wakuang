import {Cfg_Item,Cfg_Level, Cfg_Pass} from "./Struct";

/*
* 2019-03-15 andy
游戏配置数据
*/
export class DataConfig{
    /**道具配置表【按类型存放】 */
    public arrItemType:Array<Array<Cfg_Item>>;
    /**道具配置表 */
    public mapItem:Map<number,Cfg_Item>;
    /**等级配置表 */
    public arrLevel:Array<Cfg_Level>;
    /**关卡配置表 */
    public arrPass:Array<Cfg_Pass>;

    private static _ins:DataConfig;
    public static get ins():DataConfig{
		if(!this._ins)
			DataConfig._ins=new DataConfig();
		return this._ins;
	}
    constructor(){
        if(DataConfig._ins != null)
			throw new Error("DataConfig is single!");
    }

    public init(http:any):void{
        if(!http)return;
        console.log("DataConfig:",http);
        // this.arrItem=[];
        let table:any = http.Items;

        // let Items:Array<Cfg_Item>=table.Cfg_Item;
        // this.arrItemType=[];
        // this.mapItem=new Map<number,Cfg_Item>();
        // for(let Item of Items){
        //     if(!this.arrItemType[Item.type]){
        //         this.arrItemType[Item.type]=new Array<Cfg_Item>();
        //     }
        //     //最多只能显示5个字
        //     Item.name = Item.name.substring(0,5);
        //     this.arrItemType[Item.type].push(Item);
        //     this.mapItem.set(Item.id,Item);
            
        // }

        // this.arrMonster=[];
        // let monsters:Array<Cfg_Monster>=table.Cfg_Monster;
        // for(let cfg of monsters){
        //     this.arrMonster[cfg.id]=cfg;
        // }

        FrameManager.ins.init(table.Cfg_Frame);
        //KingManager.ins.initData(table.Cfg_Action);
        //SkillManager.ins.initData(table.Cfg_Skill);

    }

    /**获得道具 */
    public getItemById(ItemIndex:number):Cfg_Item{
        return this.mapItem.get(ItemIndex);
    }
    /**获得道具 */
    public getItems(type:number):Array<Cfg_Item>{
        return this.arrItemType[type];
    }

    /**获得等级 */
    public getLevel(lvl:number):Cfg_Level{
        return this.arrLevel[lvl];
    }



}
