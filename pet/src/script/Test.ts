import { DataConfig } from "../custom/config/DataConfig";
import { Cfg_Item, Struct_Bag, Struct_Equip, Struct_MinRank, Struct_MinRecord, Struct_MinRecordPrize } from "../custom/config/Struct";
import { CustomDefine, Environment } from "../custom/CustomDefine";
import { CustomWindow } from "../custom/ui/CustomWindow";
import { HttpName, HttpManager, HttpMethod } from "../manager/HttpManager";
import { AppCtrl } from "./AppCtrl";
import { BagData } from "./bag/BagData";
import { GameCtrl } from "./GameCtrl";
import { LogCtrl } from "./LogCtrl";
import MinNoticeCtrl, { MinNoticeData } from "./min/MinNoticeCtrl";
import { UserData } from "./user/UserData";

/*
* 2021-05-28 andy
测试
*/
export class Test {
	/** 是否调试环境  */
	public isDebug: boolean = false;

	private static _ins: Test;
	public static get ins(): Test {
		if (!this._ins)
			Test._ins = new Test();
		return this._ins;
	}
	constructor() {
		if (Test._ins != null)
			throw new Error("Test is single!");
	}


	public init(): void {
		//APP 开发环境
		if(CustomDefine.environment == Environment.DEBUG ||CustomDefine.environment == Environment.TEST ||this.isDebug){
			this.addVersionWord();
		}
		Laya.Stat.show(0,0);
		//只有本地调试模式，才执行
		if(!this.isDebug){
			return;
		}
		Laya.Stat.show(0,0);
		Laya.SoundManager.autoStopMusic = true;
		
		Laya.stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown);
		//this.getToken();
		//2021-05-28 andy 背包模拟数据
		// this.initBagData();
		//2021-06-03 andy 挖矿排行数据
		//this.initMiningRank();
		//2021-06-04 andy 挖矿记录数据
		// this.initMiningRecord();

		Laya.timer.once(2000,this,()=>{
			this.initMinNotice();
		})
		Laya.timer.once(10000, this, () => {
			//AppCtrl.ins.appConvert("12314657964654646");
		})

		
	}


	onKeyDown(e) {
		if (e.keyCode == 49) {
			HttpManager.ins.sendMsg(HttpName.MININIT, { user_id: HttpManager.ins.uid }, HttpMethod.POST, (msg: string, method: string, e) => {
				console.log("初始化矿洞", JSON.stringify(e))
				HttpManager.ins.sendMsg("/mining/v2/white/model/run", { time: 5 }, HttpMethod.POST, (msg: string, method: string, e) => {
					console.log("初始化模型", JSON.stringify(e))
				});
			});
		}
		if (e.keyCode == 98) {
			HttpManager.ins.sendMsg(HttpName.MININIT, { user_id: HttpManager.ins.uid }, HttpMethod.POST, (msg: string, method: string, e) => {
				console.log("仅仅初始化矿洞", JSON.stringify(e))
			});
		}
		if (e.keyCode == 99) {
			UIManager.ins.openWindow(CustomWindow.minRank);
		}
	}
	public addVersionWord(): void {

		if(Laya.stage.getChildByName("TESTCONTENT")){
			Laya.stage.getChildByName("TESTCONTENT").removeSelf();
		}
		let a: Laya.Label = new Laya.Label(); a.y = 700;
		a.name = "TESTCONTENT"
		a.text = "751831"; a.fontSize = 60; a.color = "#ffff00";
		Laya.stage.addChild(a);

	}
	/** token获得 */
	public getToken(): void {
		//高级号
		// var data = {
		// 	phone: "15666355528",
		// 	password: "abc123456"
		// };
		//
		var data = {
			phone: "15649868888",
			password: "tw123456"
		};
		HttpManager.ins.keyHeaders = null;
		console.log("get token, data=" + JSON.stringify(data));
		HttpManager.ins.sendMsg(HttpName.token, data, HttpMethod.POST, (msg: string, method: string, e) => {
			console.log("http消息成功！" + msg + ",json=" + JSON.stringify(e));
		});
	}

	private initBagData(): void {
		//2021-06-道具配置表
		let tb: any = { table: { Cfg_Item: [] } };
		let cfg: Cfg_Item = new Cfg_Item();
		cfg = new Cfg_Item(); cfg.id = 1; cfg.name = "帽子1"; cfg.type = 1; cfg.type_index = 1; cfg.spuid = 0; tb.table.Cfg_Item.push(cfg);
		cfg = new Cfg_Item(); cfg.id = 2; cfg.name = "帽子2"; cfg.type = 1; cfg.type_index = 2; cfg.spuid = 0; tb.table.Cfg_Item.push(cfg);
		cfg = new Cfg_Item(); cfg.id = 3; cfg.name = "帽子3"; cfg.type = 1; cfg.type_index = 3; cfg.spuid = 0; tb.table.Cfg_Item.push(cfg);

		cfg = new Cfg_Item(); cfg.id = 4; cfg.name = "手镯1"; cfg.type = 2; cfg.type_index = 1; cfg.spuid = 0; tb.table.Cfg_Item.push(cfg);
		cfg = new Cfg_Item(); cfg.id = 5; cfg.name = "手镯2"; cfg.type = 2; cfg.type_index = 2; cfg.spuid = 0; tb.table.Cfg_Item.push(cfg);
		cfg = new Cfg_Item(); cfg.id = 6; cfg.name = "手镯3"; cfg.type = 2; cfg.type_index = 3; cfg.spuid = 0; tb.table.Cfg_Item.push(cfg);

		cfg = new Cfg_Item(); cfg.id = 7; cfg.name = "上衣1"; cfg.type = 3; cfg.type_index = 1; cfg.spuid = 0; tb.table.Cfg_Item.push(cfg);
		cfg = new Cfg_Item(); cfg.id = 8; cfg.name = "上衣2"; cfg.type = 3; cfg.type_index = 2; cfg.spuid = 0; tb.table.Cfg_Item.push(cfg);
		cfg = new Cfg_Item(); cfg.id = 9; cfg.name = "上衣3"; cfg.type = 3; cfg.type_index = 3; cfg.spuid = 0; tb.table.Cfg_Item.push(cfg);

		cfg = new Cfg_Item(); cfg.id = 10; cfg.name = "裤子1"; cfg.type = 4; cfg.type_index = 1; cfg.spuid = 0; tb.table.Cfg_Item.push(cfg);
		cfg = new Cfg_Item(); cfg.id = 11; cfg.name = "裤子2"; cfg.type = 4; cfg.type_index = 2; cfg.spuid = 0; tb.table.Cfg_Item.push(cfg);
		cfg = new Cfg_Item(); cfg.id = 12; cfg.name = "裤子3"; cfg.type = 4; cfg.type_index = 3; cfg.spuid = 0; tb.table.Cfg_Item.push(cfg);

		DataConfig.ins.init(tb);

		let json: any = { data: [] };
		let bag: Struct_Bag = new Struct_Bag();
		for (let i = 1; i <= 12; i++) {
			bag = new Struct_Bag();
			bag.id = i; bag.itemId = i;

			json.data.push(bag);
		}
		BagData.ins.initBag(json);

		//模拟身上装备数据
		json = { data: [] };
		let equip: Struct_Equip = new Struct_Equip();
		equip = new Struct_Equip();
		equip.id = 1; equip.itemId = 3;
		json.data.push(equip);

		equip = new Struct_Equip();
		equip.id = 2; equip.itemId = 4;
		json.data.push(equip);
		BagData.ins.initEquip(json);
	}


	/** 挖矿记录 */
	public initMiningRecord(): void {
		let json: any = { data: [] };
		let month_list: Array<any> = [];
		json.data.month_list = month_list;
		month_list.push({ month: "202105", coin_count: 500, treasure_count: 0 });
		month_list.push({ month: "202104", coin_count: 400, treasure_count: 1 });
		month_list.push({ month: "202103", coin_count: 300, treasure_count: 3 });
		month_list.push({ month: "202102", coin_count: 300, treasure_count: 3 });
		month_list.push({ month: "202101", coin_count: 300, treasure_count: 3 });
		month_list.push({ month: "202012", coin_count: 300, treasure_count: 3 });
		month_list.push({ month: "202011", coin_count: 300, treasure_count: 3 });
		month_list.push({ month: "202010", coin_count: 300, treasure_count: 3 });
		month_list.push({ month: "202009", coin_count: 300, treasure_count: 3 });
		month_list.push({ month: "202008", coin_count: 300, treasure_count: 3 });
		month_list.push({ month: "202007", coin_count: 300, treasure_count: 3 });


		let day_list: Array<any> = [];
		json.data.day_list = day_list;
		for (let i = 1; i <= 10; i++) {
			let struct: any = new Object();
			struct.id = i;
			struct.month = "202105";
			struct.day = 11 - i;
			let rand: number = Math.random();
			struct.count = rand < 0.03 ? 3 : rand < 0.1 ? 2 : rand < 0.3 ? 1 : 0;
			struct.reward = (31 - i) * 100;
			struct.duration = i * 200;
			struct.expended = 100;

			let treasures: Array<any> = [];
			struct.treasures = treasures;
			if (i == 1) {
				let prize: any = new Object();
				prize.id = 1;
				prize.avatar = Define.CDN + "min/clothes1.png";
				prize.exchanged = 0;
				treasures.push(prize);

				prize = new Object();
				prize.id = 2;
				prize.avatar = Define.CDN + "min/box.png";
				prize.exchanged = 1;
				treasures.push(prize);
			} else if (i == 2) {

			}

			day_list.push(struct);
		}

		let un_exchanges: Array<any> = [];
		json.data.un_exchanges = un_exchanges;
		let exchanges: any;
		exchanges = new Object();
		exchanges.id = 2;
		exchanges.avatar = Define.CDN + "min/box.png";
		exchanges.status = 0;
		exchanges.desc = "天下无敌冲锋衣";
		exchanges.price = 999;
		un_exchanges.push(exchanges);

		exchanges = new Object();
		exchanges.id = 3;
		exchanges.avatar = Define.CDN + "min/box.png";
		exchanges.status = 0;
		exchanges.desc = "天下无敌";
		exchanges.price = 888;
		un_exchanges.push(exchanges);

		UserData.ins.initMinRecord(json);
	}

	/** 挖矿排行 */
	public initMiningRank(): void {
		let json: any = { data: { day: [], week: [], month: [] }, rankType: 1 };

		for (let i = 1; i <= 30; i++) {
			let struct: any = new Object();
			struct.user_id = i;
			struct.user_name = "andy" + i;
			struct.user_avatar = Define.CDN + "min/head1.jpg";
			struct.reward = (31 - i) * 100;

			let treasures: Array<any> = [];
			struct.treasure_avatars = treasures;
			if (i % 4 == 1) {
				let prize: any = new Object();
				prize.id = 1;
				prize.avatar = Define.CDN + "min/clothes1.png";
				prize.coin_value = 100;
				treasures.push(prize);

				prize = new Object();
				prize.id = 2;
				prize.avatar = Define.CDN + "min/box.png";
				prize.coin_value = 200;
				treasures.push(prize);
			} else if (i % 4 == 2) {
				let prize: any = new Object();
				prize.id = 1;
				prize.avatar = Define.CDN + "min/clothes1.png";
				prize.coin_value = 100;
				treasures.push(prize);

				prize = new Object();
				prize.id = 2;
				prize.avatar = Define.CDN + "min/box.png";
				prize.coin_value = 200;
				treasures.push(prize);

				prize.id = 3;
				prize.avatar = Define.CDN + "min/clothes1.png";
				prize.coin_value = 100;
				treasures.push(prize);
			} else if (i % 4 == 3) {
				let prize: any = new Object();
				prize.id = 1;
				prize.avatar = Define.CDN + "min/clothes1.png";
				prize.coin_value = 100;
				treasures.push(prize);
			} else {

			}
			json.data.day.push(struct);
		}
		for (let i = 1; i <= 5; i++) {
			let struct: any = new Object();
			struct.user_id = i;
			struct.user_name = "andy" + i;
			struct.user_avatar = Define.CDN + "min/head1.jpg";
			struct.reward = (31 - i) * 100;

			let treasures: Array<any> = [];
			struct.treasure_avatars = treasures;
			if (i % 4 == 1) {
				let prize: any = new Object();
				prize.id = 1;
				prize.avatar = Define.CDN + "min/clothes1.png";
				prize.coin_value = 100;
				treasures.push(prize);

				prize = new Object();
				prize.id = 2;
				prize.avatar = Define.CDN + "min/box.png";
				prize.coin_value = 200;
				treasures.push(prize);
			} else if (i % 4 == 2) {
				let prize: any = new Object();
				prize.id = 1;
				prize.avatar = Define.CDN + "min/clothes1.png";
				prize.coin_value = 100;
				treasures.push(prize);

				prize = new Object();
				prize.id = 2;
				prize.avatar = Define.CDN + "min/box.png";
				prize.coin_value = 200;
				treasures.push(prize);

				prize.id = 3;
				prize.avatar = Define.CDN + "min/clothes1.png";
				prize.coin_value = 100;
				treasures.push(prize);
			} else if (i % 4 == 3) {
				let prize: any = new Object();
				prize.id = 1;
				prize.avatar = Define.CDN + "min/clothes1.png";
				prize.coin_value = 100;
				treasures.push(prize);
			} else {

			}
			json.data.week.push(struct);
		}
		UserData.ins.initMinRank(json);
	}
	//测试挖矿中奖通知
	public initMinNotice(): void {
		let json: any = { type: "mining", data: {} };
		let data: any = {};
		data.user_id = "1001";
		data.user_name = "天道酬勤";
		data.user_avatar = "game/head.png";
		data.treasure_id = "100001";
		data.treasure_avatar = "game/head.png";
		data.treasure_desc = "FAVS2案发时大幅度发大水发声法时发断";
		data.coin = 100;
		AppCtrl.ins.appNotice("mining", JSON.stringify(data));

		// data.treasure_desc = "FAVS2案发时大幅度i而无声的空间发生FSA";
		// data.coin = 15200;
		// AppCtrl.ins.appNotice("mining", JSON.stringify(data));
	}


}