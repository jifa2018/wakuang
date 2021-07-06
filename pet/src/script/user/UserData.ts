import { Struct_Bag, Struct_Equip, Struct_MinRank, Struct_MinRecord, Struct_MinRecordPrize } from "../../custom/config/Struct";
import { CustomDefine } from "../../custom/CustomDefine";
import { NoticeContent } from "../publicNotice/NoticeContnet";
/*
* 2021-05-27 andy
用户宠物信息
*/
export class UserData {
	/** 用户名字 */
	public name: string = "";
	/** 用户头像 */
	public head: string = "";
	/** 用户性别 */
	public sex: number = 0;
	/** 用户凸币 */
	public gold: number = 500000;
	/** 用户等级 */
	public level: number = 0;
	/** 用户标识 */
	public identity: string = "";
	/** 用户APP版本号 */
	public appVersion: string = "";

	/** 是否挖矿中 */
	public isMining: boolean = false;

	/** 挖矿今日排行数据 */
	public arrMinRank1: Array<Struct_MinRank>;
	/** 挖矿上周排行数据 */
	public arrMinRank2: Array<Struct_MinRank>;
	/** 挖矿上月排行数据 */
	public arrMinRank3: Array<Struct_MinRank>;
	/** 挖矿榜单上的自己 */
	public selfMinRank: Struct_MinRank;
	/** 挖矿排行上次请求时间 */
	public lastMinGetTime: number = 0;

	/** 挖矿记录列表 */
	public arrMinRecord: Array<Struct_MinRecord>;
	/** 当前查看月份 */
	public minRecordMonth: string;
	/** 当前查看月份的索引，选中月份菜单时，滚动条定位用 */
	public minRecordMonthIndex: number;
	/** 当前年份 */
	public minRecordYear: number;
	/** 当日挖矿记录是否请求 */
	public isGetRecordToday: boolean =false;
	/** 挖矿记录列表 */
	public arrMinRecordMonth: Array<Struct_MinRecord>;
	/** 挖矿记录列表按月份缓存 */
	public mapMinRecordMonth: Map<string, Array<Struct_MinRecord>>;
	/** 挖矿未兑换奖励 */
	public arrMinRecordPrize: Array<Struct_MinRecordPrize>;
	/** 今日挖到的凸币 */
    public todayGold:number = 0;

	private static _ins: UserData;
	public static get ins(): UserData {
		if (!this._ins)
			UserData._ins = new UserData();
		return this._ins;
	}
	constructor() {
		if (UserData._ins != null)
			throw new Error("UserData is single!");
		this.arrMinRecordMonth = [];
		this.mapMinRecordMonth = new Map<string, Array<Struct_MinRecord>>();
		EventManager.ins.on(CustomDefine.EVENT_CHANGE_DAY,this,this.EVENT_CHANGE_DAY);
	}
	private EVENT_CHANGE_DAY(evt:NoticeContent):void{
		this.isGetRecordToday = false;
		this.arrMinRank2 = null;
		this.arrMinRank3 = null;
	}

	//------挖矿排行-----------
	/** 获得挖矿列表 */
	public initMinRank(obj: any): void {
		let day: Array<any> = obj.data.day;
		let week: Array<any> = obj.data.week;
		let month: Array<any> = obj.data.month;

		if (day != null) {
			this.selfMinRank = null;
			this.lastMinGetTime = Laya.timer.currTimer;
			this.arrMinRank1=[];
			this.arrMinRank1 = this.setRankData(day);
		}
		if (week != null) {
			this.arrMinRank2=[];
			this.arrMinRank2 = this.setRankData(week, false);
		}
		if (month != null) {
			this.arrMinRank3=[];
			this.arrMinRank3 = this.setRankData(month, false);
		}
		EventManager.ins.event(CustomDefine.EVENT_MIN_RANK, {});
	}
	private setRankData(ranks: Array<any>, isDay: boolean = true): Array<Struct_MinRank> {
		let arrRank: Array<Struct_MinRank> = [];
		
		if (ranks && ranks instanceof Array) {
			let index: number = 0;
			for (let rank of ranks) {
				let struct: Struct_MinRank = new Struct_MinRank();
				struct.index = index++;
				struct.id = rank.user_id;
				struct.gold = Number(rank.reward);
				if (isDay && rank.user_name == this.name) {
					this.selfMinRank = struct;
					//2021-06-29 排行榜每日用本地的数据
					struct.gold = UserData.ins.todayGold;
				}
				struct.name = rank.user_name;//.substring(0,6);
				struct.head = rank.user_avatar;
				

				struct.arrPrize = [];
				struct.boxCount = 0;
				struct.boxValue = 0;
				if (rank.treasure_avatars) {
					for (let treasure of rank.treasure_avatars) {
						let prize: Struct_MinRecordPrize = new Struct_MinRecordPrize();
						prize.icon = treasure.avatar;
						prize.coinPrice = treasure.coin_value;
						struct.arrPrize.push(prize);
						struct.boxCount += 1;
						struct.boxValue += prize.coinPrice;
					}
				}
				arrRank.push(struct);
			}
			//2021-06-29 每日排行，把本地数据插入，重新排下，本地和服务端数据有偏差
			if(isDay && this.selfMinRank){
				arrRank.sort(this.sortByGold);
			}
			
			return arrRank;
		}
	}
	private sortByGold(rank1:Struct_MinRank,rank2:Struct_MinRank):number{
		if(rank1.gold>rank2.gold){
			return -1;
		}
		return 1;
	}
	/** 根据时间类型获得挖矿列表 */
	public getMinRankByType(rankType: number): Array<Struct_MinRank> {
		return rankType == 1 ? this.arrMinRank1 : rankType == 2 ? this.arrMinRank2 : this.arrMinRank3;
	}

	//------挖矿记录-----------
	/** 获得挖矿记录 */
	public initMinRecord(obj: any): void {
		let month_list: Array<any> = obj.data.month_list;
		let day_list: Array<any> = obj.data.day_list;

		let month: string = obj.data.month;
		
		//初次请求,默认是月份是数组第一个
		if (month == null || month == "") {
			if (month_list && month_list.length > 0) {
				month = month_list[0].month;
				this.minRecordYear = Number(month.substr(0, 4));
			}
			this.arrMinRecord = [];
			this.arrMinRecordPrize = [];
			this.arrMinRecordMonth=[];
			this.mapMinRecordMonth.clear();
			this.isGetRecordToday = true;
		}
		this.minRecordMonth = month;
		//每日数据
		let arrDay: Array<Struct_MinRecord> = [];
		if (day_list && day_list instanceof Array) {
			for (let day of day_list) {
				let record: Struct_MinRecord = new Struct_MinRecord();
				record.id = 0;//服务端没有编号
				record.count = day.count;
				record.time = day.duration;
				record.hp = day.expended;
				record.gold = Number(day.reward);
				//2021-06-23 andy 服务端给的是 2021年06月23日，只把23取出来
				record.day = day.day.substring(day.day.indexOf("月") + 1, day.day.indexOf("日"));//day.day;
				record.month_year = "";
				record.month = Number(month.substr(4, 2));

				record.arrPrize = [];
				if (day.treasures) {
					for (let treasure of day.treasures) {
						let prize: Struct_MinRecordPrize = new Struct_MinRecordPrize();
						prize.icon = treasure.avatar;
						prize.status = treasure.exchanged;
						record.arrPrize.push(prize);
					}

				}

				arrDay.push(record);
			}
			this.mapMinRecordMonth.set(month, arrDay);
		}

		//月份列表
		if (month_list && month_list instanceof Array) {
			//按月份分组
			for (let record of month_list) {

				let struct: Struct_MinRecord = new Struct_MinRecord();
				struct.id = 0;
				struct.month_year = record.month;
				struct.year = record.month.substring(0, 4);
				struct.month = Number(record.month.substr(4, 2));
				struct.gold = Number(record.coin_count);
				struct.count = Number(record.treasure_count);

				struct.day = 0;
				struct.time = 0;
				struct.hp = 0;
				this.arrMinRecordMonth.push(struct);
			}
		}
		
		let un_exchanges: Array<any> = obj.data.un_exchanges;
		//为兑换奖品列表
		if (un_exchanges && un_exchanges instanceof Array) {
			this.arrMinRecordPrize=[];
			//按月份分组
			for (let exchange of un_exchanges) {

				let struct: Struct_MinRecordPrize = new Struct_MinRecordPrize();
				struct.id = exchange.id;
				struct.desc = exchange.desc;
				struct.price = exchange.price;
				struct.icon = exchange.avatar;
				this.arrMinRecordPrize.push(struct);
			}
		}


		EventManager.ins.event(CustomDefine.EVENT_MIN_RECORD);
	}

	/** 是否已经请求过挖矿记录 */
	public isHaveMinRecordByMonth(month: string): boolean {
		return this.mapMinRecordMonth.has(month);
	}
	/** 获得挖矿记录列表 */
	public getMinRecord(): Array<Struct_MinRecord> {
		this.minRecordMonthIndex = 0;
		let ret: Array<Struct_MinRecord> = [];
		//按月份分组
		for (let record of this.arrMinRecordMonth) {

			ret.push(record);
			//是选中月份，直接将每日数据插入
			if (this.minRecordMonth == record.month_year) {
				this.minRecordMonthIndex = ret.length - 1;
				let arrDay: Array<Struct_MinRecord> = this.mapMinRecordMonth.get(this.minRecordMonth);
				ret = ret.concat(arrDay);

			}
		}
		return ret;
	}
	/** 获得挖矿记录列表 */
	public getMinRecordPrize(): Array<Struct_MinRecordPrize> {
		let ret: Array<Struct_MinRecordPrize> = this.arrMinRecordPrize;
		return ret;
	}
}

export class EQUIP_TYPE {
	/** 帽子 */
	public static hat: number = 1;
	/** 发带 */
	public static hair: number = 2;
	/** 眼镜 */
	public static eye: number = 3;
	/** 耳饰 */
	public static ear: number = 4;
	/** 项链 */
	public static neck: number = 5;
	/** 上衣 */
	public static body: number = 6;
	/** 手镯 */
	public static arm: number = 7;
	/** 戒指 */
	public static ring: number = 8;
	/** 腰带 */
	public static belt: number = 9;
	/** 裤子*/
	public static leg: number = 10;
	/** 鞋*/
	public static foot: number = 11;

}
export class EQUIP_NAME {
	/** 帽子 */
	public static hat: string = "帽子";
	/** 发带 */
	public static hair: string = "发带";
	/** 眼镜 */
	public static eye: string = "眼镜";
	/** 耳饰 */
	public static ear: string = "耳饰";
	/** 项链 */
	public static neck: string = "项链";
	/** 上衣 */
	public static body: string = "上衣";
	/** 手镯 */
	public static arm: string = "手镯 ";
	/** 戒指 */
	public static ring: string = "戒指";
	/** 腰带 */
	public static belt: string = "腰带";
	/** 裤子*/
	public static leg: string = "裤子";
	/** 鞋*/
	public static foot: string = "鞋";

}