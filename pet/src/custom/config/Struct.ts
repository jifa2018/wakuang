/*********** 服务端通讯  **************/

/*
* 身上的装备
*/
export class Struct_Equip{
    constructor(){

    }
    /** 物品索引 */
    public id:number;
    /** 物品ID */
    public itemId:number;
    /** 背包配置 */
    public cfg:Cfg_Item;
    
}
/*
* 道具
*/
export class Struct_Bag{
    constructor(){

    }
    /** 物品索引 */
    public id:number;
    /** 物品ID */
    public itemId:number;
    /** 背包配置 */
    public cfg:Cfg_Item;
}
/*
* 挖矿排行 2021-06-03 andy
*/
export class Struct_MinRank{
    constructor(){

    }
    /** 排行榜名次 */
    public index:number;
    /** 用户ID */
    public id:string;
    /** 用户名字  */
    public name:string;
    /** 头像 */
    public head:string;
    /** 宝箱数量 */
    public boxCount:number;
    /** 宝箱凸币价值 */
    public boxValue:number;
    /** 凸币数量 */
    public gold:number;
    /** 挖出实物数组 */
    public arrPrize:Array<Struct_MinRecordPrize>;
}

/*
* 挖矿记录 2021-06-04 andy
*/
export class Struct_MinRecord{
    constructor(){
    }
    /** 记录编号 */
    public id:number;
    /** 记录月份年份  */
    public month_year:string;
    /** 记录年份  */
    public year:number;
    /** 记录月份  */
    public month:number;
    /** 记录某天 */
    public day:number;
    /** 挖矿耗时 */
    public time:number;
    /** 挖矿次数 或 宝箱数量 */
    public count:number;
    /** 消耗体力 */
    public hp:number;
    /** 凸币数量 */
    public gold:number;
    /** 挖出实物数组 */
    public arrPrize:Array<Struct_MinRecordPrize>;
}
/*
* 挖矿记录奖品 2021-06-05 andy
*/
export class Struct_MinRecordPrize{
    constructor(){

    }
    /** 实物编号 */
    public id:number;
    /** 实物价格 */
    public price:number;
    /** 实物凸币价格 */
    public coinPrice:number;
    /** 实物描述 */
    public desc:string;
    /** 实物图片 */
    public icon:string;
    /** 实物领取状态 */
    public status:number;
    
}

/*********** 本地配置表  **************/
/*
* 
*/
export class Cfg_Item{
    constructor(){

    }
    /** 物品ID */
    public id:number;
    /** 道具描述  */
    public name:string;
    /** 0.男 1.女 */
    public sex:number=0;
    /** 道具类型 */
    public type:number;
    /** 道具子类型 */
    public type_index:number;
    /** 道具商品ID */
    public spuid:number;
    /** 道具icon */
    public icon:string;

    
}

/*
* 等级经验表
*/
export class Cfg_Level{
    constructor(){

    }
    public id:number;
    public lvl:number;
    /**需要经验 */
    public exp:number;
    /**时间 */
    public time:number;
    /**速度 */
    public speed:number;
    /**速度间隔 */
    public speedTime:number;
    /**可随机的关卡*/
    public randPass:string;
    /**可随机的关卡*/
    public randCount:string;

    /**最小个数 */
    public minCount:number;
    /**最大个数 */
    public maxCount:number;
    /**可随机的关卡 */
    public arrPass:Array<string>;
    /**子弹数量 */
    public bulletCount:number;
    /**射击目标数量 */
    public hitItemCount:number;
}
/*
* 关卡表
*/
export class Cfg_Pass{
    constructor(){

    }
    public id:number;
    public lvl:number;
    /**可随机的关卡 */
    public arrPos:Array<Laya.Vector3>;
}

