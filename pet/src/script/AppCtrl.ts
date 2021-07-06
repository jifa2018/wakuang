import { UserData } from "./user/UserData";
import { HttpManager } from "../manager/HttpManager";
import { Test } from "./Test";
import { CustomDefine, Environment, ModuleType } from "../custom/CustomDefine";
import { LoadingCtrl } from "./LoadingCtrl";
import MinNoticeCtrl, { MinNoticeData } from "./min/MinNoticeCtrl";

import { GameCtrl } from "./GameCtrl";

import { PublicNoticeMgr } from "./publicNotice/PublicNoticeMgr";
import { CustomWindow } from "../custom/ui/CustomWindow";
import { NOTICETYPE, RUNTYPE } from "./publicNotice/BaseNotice";
import { Game } from "../Game";
import { LogCtrl } from "./LogCtrl";
/*
* 2021-06-07 andy
	与App交互控制
*/
export class AppCtrl {
	public json: string;
	/** 从App传来的type 0.宠物 1.挖矿 */
	public type: string = "";
	/** App导航菜单最大高度*/
	private appMenuBgHeightMax: number = 166;
	/** 2021-06-28 andy App像素密度*/
	public appPixelRatio: number = 0;
	/** App导航菜单高度，由App提供 */
	public appMenuBgHeight: number = 166;
	/** 2021-06-24 andy 是否在游戏页面 */
	public isHomePage: boolean = false;
	/** 2021-07-03 andy App得到的系统信息 */
	public appSystemInfo: any ;
	
	/** 2021-06-30 andy 腾讯打印控制台 */
	private vConsole: any;


	private static _ins: AppCtrl;
	public static get ins(): AppCtrl {
		if (!this._ins)
			AppCtrl._ins = new AppCtrl();
		return this._ins;
	}
	constructor() {
		if (AppCtrl._ins != null)
			throw new Error("AppCtrl is single!");
		this.init();
	}
	public init(): void {
		//2021-06-17 andy 由APP提供关闭声音
		Laya.Browser.window.openGameSound = (open) => {
			this.openGameSound(open);
		}
		Laya.Browser.window.appNotice = (type, param) => {
			this.appNotice(type, param);
		}
		//2021-07-01 andy 宝藏兑换
		Laya.Browser.window.appConvert = (spuId) => {
			this.appConvert(spuId);
		}
		//2021-07-02 andy 是否活着
		Laya.Browser.window.isAlive = () => {
			return true;
		}
		
	}

	//--------------APP主动调用 start-----------------
	private openGameSound(open: boolean): void {
		console.log("App主动调用 openGameSound:", open);
		SoundManager.ins.setOn(open)
		if (open) {
			Laya.stage.frameRate = Stage.FRAME_SLOW;
			Laya.stage.timer.once(200, this, () => {
				//SoundManager.ins.playMusic(game.Define.SOUND_MAIN);
			});
			EventManager.ins.event(CustomDefine.EVENT_FOUCE, true);
		} else {
			EventManager.ins.event(CustomDefine.EVENT_FOUCE, false);
			//失去焦点时，调为睡眠模式
			Laya.stage.frameRate = Stage.FRAME_SLEEP;
		}

		//2021-06-24 andy 失去焦点时，主动设置
	}
	//通知消息
	public appNotice(type: string, param: string): void {
		console.log("App主动调用 appNotice:", type, param);

		if (type) {
			let data: any = JSON.parse(param);
			switch (type) {
				case "mining":
					this.temporaryNotice(data);
					break;
				default:
					break;
			}
		}
	}

	temporaryNotice(param) {
		if (!param) return
		//user_id treasure_id treasure_desc treasure_icon
		let e = {
			type: NOTICETYPE.noticeContnet,
			runTime: 4,
			runType: RUNTYPE.right,
			stopTime: 0,
			temporary: true,
			head: param.user_avatar,
			userName: param.user_name,
			icon: param.coin,
			treasurer_avatar: param.treasure_avatar,
			itemName:param.treasure_desc
		}
		console.log("添加新的消息", e)
		PublicNoticeMgr.ins().onCreateBaseNoticeItem(e, null);
	}

	public appConvert(spuId:string):void{
		console.log("App主动调用 appConvert:", spuId);
		EventManager.ins.event(CustomDefine.EVENT_APP_CONVERT,spuId);
	}

	//--------------APP主动调用 end-----------------


	//是否在APP
	private isInApp(isShowWord: boolean = true): boolean {
		if (!Laya.Browser.window.flutter_inappwebview) {
			if (isShowWord) TipManager.ins.showWord("请在凸物App端关闭！");
			return false;
		}
		return true;
	}
	public checkFlutterReady(callBack: Function): void {
		//游戏启动时，首先加载监听事件
		Laya.Browser.window.addEventListener("flutterInAppWebViewPlatformReady", (event) => {
			//2021-06-23 andy App导航高度
			this.flutterReady(callBack);
		});
		//有可能已经初始化完毕，此时直接调用
		this.flutterReady(callBack);
		//如果1秒没有，则进入本地调试环境
		Laya.timer.once(500, this, () => {
			if (!this.isInApp(false)) {

				Test.ins.isDebug = true;
				Define.width = Laya.Browser.width;
				Define.height = Laya.Browser.height;
				callBack();
				return;
			}
		})
	}
	//flutter准备就绪  getUserInfo
	private flutterReady(callBack: Function): void {
		if (!this.isInApp(false)) return;
		Laya.Browser.window.flutter_inappwebview.callHandler('systemInfo').then((result) => {
			this.appSystemInfo = result;
			// 屏幕密度
			this.appPixelRatio = result.pixelRatio;
			// dp：屏幕宽
			Define.width = result.width * this.appPixelRatio;
			// dp：屏幕高
			Define.height = result.height * this.appPixelRatio;
			//dp：appBar高
			let appBar: number = result.appBar;
			
			//dp：navigationBar高
			let navigationBar: number = result.navigationBar * this.appPixelRatio;

			navigationBar = navigationBar / (Define.height / Define.DeviceH);
			//不能超过最大值，模糊界面就那么高
			this.appMenuBgHeight = navigationBar > this.appMenuBgHeightMax ? this.appMenuBgHeightMax : navigationBar;
			//console.log("调用systemInfo：", JSON.stringify(result), "App导航菜单高度：", this.appMenuBgHeight);

			//
			this.isHomePage = result.isHomePage;
		});
		Laya.Browser.window.flutter_inappwebview.callHandler('userInfo').then((result) => {
			this.setUserInfo(result);
			console.log("调用systemInfo：", JSON.stringify(this.appSystemInfo), "App导航菜单高度：", this.appMenuBgHeight);
			callBack();
		});
	}

	private setUserInfo(obj: any): void {
		console.log(JSON.stringify(obj));
		HttpManager.ins.token = obj.userToken;
		HttpManager.ins.uid = obj.userId;

		UserData.ins.name = obj.userName;
		UserData.ins.head = obj.userAvatar;
		UserData.ins.sex = Number(obj.userSex);
		UserData.ins.identity = obj.userIdentity;

		CustomDefine.appVersion = obj.appVersion;
		CustomDefine.environment = obj.environment.replace("Environment.", "");

		LogCtrl.ins.resetLog();
		this.type = ModuleType.MIN;//HttpManager.ins.getQueryVariable("type");
		//2021-06-28 andy 增加腾讯打印日志
		if (CustomDefine.environment == Environment.DEBUG) {
			// this.vConsole = new Laya.Browser.window.VConsole();
			// Laya.timer.once(2000,this,()=>{
			// 	this.vConsole.setSwitchPosition(0,400/this.appPixelRatio);
			// 	console.log("vConsole.bottom:",400/this.appPixelRatio);
			// });

		}

		console.log("App传入uid：", obj.userId, "sex:", obj.userSex, "type", this.type, "environment:", CustomDefine.environment, "token：", HttpManager.ins.token);
	}
	/**
	 * 2021-06-04 andy 全局统一返回按钮
	 */
	public addTopCloseButton(): void {
		let btnClose: Laya.Button = new Laya.Button("loading/btn_goback.png");
		btnClose.x = Define.DeviceW - 70;
		btnClose.y = 10;
		btnClose.label = "";
		btnClose.stateNum = 1;
		LayerManager.ins.addChild(btnClose, LayerName.top);
		btnClose.on(Laya.Event.MOUSE_DOWN, this, () => {
			AppCtrl.ins.goBack();
		})
	}
	/**
	 * 返回到APP 
	 * @returns 
	 */
	public goBack(): void {
		console.log("调用flutter_inappwebview.goBack");
		if (!this.isInApp()) return;
		SoundManager.ins.setOn(false);
		Laya.Browser.window.flutter_inappwebview.callHandler('goBack');
	}
	/**
	 * 返回到APP 彻底关闭游戏
	 * @returns 
	 */
	public close(): void {
		console.log("调用flutter_inappwebview.close");
		if (!this.isInApp()) return;
		Laya.Browser.window.flutter_inappwebview.callHandler('close');
	}
	/**
	 * 返回到APP商店,启动商品详情
	 * @param productId 
	 * @returns 
	 */
	public goShop(productId: string): void {
		console.log("调用flutter_inappwebview.productDetail", productId);
		if (!this.isInApp()) return;
		Laya.Browser.window.flutter_inappwebview.callHandler('productDetail', { spuId: productId });
	}

	/**
	 * 宝藏兑换
	 * @param productId 产品ID
	 * @returns 
	 */
	public goExchange(productId: string): void {
		console.log("调用flutter_inappwebview.exchangeTreasure", productId);
		if (!this.isInApp()) return;
		Laya.Browser.window.flutter_inappwebview.callHandler('exchangeTreasure', { spuId: productId });
	}
	/**
	 * 切换系统状态栏颜色
	 * @param color light 或者 dark
	 * @returns 
	 */
	public changeSysBarColor(color: string): void {
		console.log("调用flutter_inappwebview.brightness", color);
		if (!this.isInApp()) return;
		Laya.Browser.window.flutter_inappwebview.callHandler('brightness', color);
	}
	/**
	 * 切换系统状态栏颜色
	 * @param color light 或者 dark
	 * @returns 
	 */
	public openAppWindow(isWindow: boolean): void {
		console.log("调用flutter_inappwebview.window", isWindow);
		if (!this.isInApp()) return;
		Laya.Browser.window.flutter_inappwebview.callHandler('window', { isWindow: isWindow });
	}
	/**
	 * 启动凸币街区
	 * @returns 
	 */
	public tobBlock(): void {
		console.log("调用flutter_inappwebview.tobBlock");
		if (!this.isInApp()) return;
		Laya.Browser.window.flutter_inappwebview.callHandler('tobBlock');
	}
	/**
	 * 2021-06-17 andy 游戏主动调用APP，让APP关闭loading
	 * @returns 
	 */
	public loadSuccess(): void {
		console.log("调用flutter_inappwebview.loadSuccess");
		if (!this.isInApp(false)) return;
		Laya.Browser.window.flutter_inappwebview.callHandler('loadSuccess');
	}
	/**
	 * 2021-06-17 andy 游戏主动调用APP，让APP关闭loading
	 * @returns 
	 */
	public loadError(): void {
		console.log("调用flutter_inappwebview.loadError");
		if (!this.isInApp(false)) return;
		Laya.Browser.window.flutter_inappwebview.callHandler('loadError');
	}

	/**
	 * 2021-06-23 andy App导航菜单模糊背景
	 * @param path 
	 */
	public changeAppMenuBg(path: string): void {
		let appMenuBg: Laya.Sprite = Global.root_top.getChildByName("appMenuBg") as Laya.Sprite;
		if (!appMenuBg) {
			appMenuBg = new Laya.Sprite();
			appMenuBg.name = "appMenuBg";
			appMenuBg.y = Define.DeviceH - this.appMenuBgHeightMax;
			Global.root_top.addChild(appMenuBg);

			//模糊图片
			let img: Laya.Image = new Laya.Image();
			appMenuBg.addChild(img);
			img.anchorX = 0.5;
			img.x = Define.canvasWidth >> 1;

			//画一个遮罩
			let mask: Laya.Sprite = new Laya.Sprite();
			mask.graphics.drawRect(0, this.appMenuBgHeightMax - this.appMenuBgHeight, Define.canvasWidth, this.appMenuBgHeight, "#000000");
			appMenuBg.mask = mask;
		}
		(appMenuBg.getChildAt(0) as Laya.Image).skin = path;
	}

	/**
	 * 2021-07-02 andy 游戏页面显示维护
	 * @returns 
	 */
	 public loadMaintain(): void {
		console.log("调用flutter_inappwebview.loadMaintain");
		if (!this.isInApp(false)) return;
		Laya.Browser.window.flutter_inappwebview.callHandler('loadMaintain');
	}
	/**
	 * 2021-07-05 andy 是否在游戏页面
	 * @returns 
	 */
	 public isMiningPage():void {     
		if (!this.isInApp(false))
			return;
		Laya.Browser.window.flutter_inappwebview.callHandler('isMiningPage').then((result) => {
			console.log("调用flutter_inappwebview.isMiningPage", result);
			this.isHomePage = result;
			SoundManager.ins.setOn(result);
		});
	}

	/**
	 * 
	 /// 进入调用需要添加addEventListener事件，按钮调用不用。
  ///
  ///<script>
  ///   点击按钮-观看单条视频
  ///   window.flutter_inappwebview.callHandler('videoDetail', {videoId: '123456'});
  ///   点击按钮-启动买家秀详情
  ///   window.flutter_inappwebview.callHandler('showDetail', {showId: '123456'});
  ///   点击按钮-启动用户详情 userIdentity: 用户身份字段
  ///   window.flutter_inappwebview.callHandler('userDetail', {userId: '123456', userIdentity: '用户身份字段'});
  ///   点击按钮-启动店铺详情
  ///   window.flutter_inappwebview.callHandler('shopDetail', {shopId: '123456'});
  ///</script>
	 */

}