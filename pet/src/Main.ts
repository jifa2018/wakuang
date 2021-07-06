import { Game } from "./Game";
import { HttpManager } from "./manager/HttpManager";
import { AppCtrl } from "./script/AppCtrl";
import { GameCtrl } from "./script/GameCtrl";
import { LoadingCtrl } from "./script/LoadingCtrl";
import { LogCtrl } from "./script/LogCtrl";
import { MsgCtrl } from "./script/MsgCtrl";
// import { Inotice } from "./script/publicNotice/Inotice";

class Main {
	constructor() {
		Define.DeviceW = 750; Define.DeviceH = 1624;
		//if(window['Config3D']) window['Config3D']['_default']['_$set_defaultPhysicsMemory']=150;
		if (window["Laya3D"]) {
			console.log("Laya3D...");
			Laya3D.init(Define.DeviceW, Define.DeviceH);
		} else {
			console.log("Laya2D");
			Laya.init(Define.DeviceW, Define.DeviceH, Laya["WebGL"]);
		}
		Laya["Physics"] && Laya["Physics"].enable();
		Laya["DebugPanel"] && Laya["DebugPanel"].enable();

		//兼容微信不支持加载scene后缀场景
		// Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
		Laya.stage.bgColor = "#000000";
		Laya.stage.frameRate = Stage.FRAME_SLOW

		//打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
		// if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
		// if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
		//Laya.alertGlobalError = true;
		//自定义=================
		
		AppCtrl.ins.checkFlutterReady(() => {
			this.appInitFinish();
		});
	}
	//2021-06-08 andy App初始化完成，在进入游戏
	private appInitFinish(): void {
		HttpManager.ins.init();
		Game.ins.init();
		
		//基础初始化
		LayerManager.ins.init();
		SceneManager.ins.init();
		//2021-06-23 andy 高度固定，宽度自适应，水平居中显示
		LayerManager.ins.getLayer(LayerName.root).x = (Define.canvasWidth - Define.DeviceW) >> 1;

		UIManager.ins.init();
		//Scene3DManager.ins.init();
		LogCtrl.ins.init();
		//平台初始化
		EventManager.ins.once(NoticeEvent.PLATFORM_INIT_OVER, this, this.PLATFORM_INIT_OVER);
		EventManager.ins.once(NoticeEvent.PLATFORM_LOGIN_SUCCESS, this, this.PLATFORM_LOGIN_SUCCESS);

		PlatformManager.ins.init(null);
	}

	private PLATFORM_INIT_OVER(e: NoticeEvent): void {
		LoadingCtrl.ins.preLoad();

	}
	private PLATFORM_LOGIN_SUCCESS(e: NoticeEvent): void {
		LoadingCtrl.ins.enterGame();
	}
}
//激活启动类
setTimeout(() => { new Main(); }, 500);

