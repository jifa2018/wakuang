import GameUI from "./user/UserUI";
import PetMono from "./user/PetMono";
import { HttpManager } from "../manager/HttpManager";
import { UserCtrl } from "./user/UserCtrl";
import { CustomWindow } from "../custom/ui/CustomWindow";
import GameConfig from "../GameConfig";
import { AppCtrl } from "./AppCtrl";
import { PublicNoticeMgr } from "./publicNotice/PublicNoticeMgr";
import { CustomDefine, Environment } from "../custom/CustomDefine";
import { Test } from "./Test";
import { Game } from "../Game";

/*
* 2021-06-30 andy
	控制台打印控制
*/
export class LogCtrl {
	//打开面板
	private btn:Laya.Button;

	private ui:Laya.Sprite;
	private txt:Laya.Text;
	//打印所有
	private btnMsgAll:Laya.Button;
	//打印部分
	private btnMsg:Laya.Button;
	//打印清除
	private btnClear:Laya.Button;
	//银行面板
	private btnHide:Laya.Button;
	private btnSkin:string;
	
	private btnW:number = 150;
	private btmH:number = 50;
	private prevY:number = 0;

	private arrMsg:Array<string>;
	private msg:string="";
	private msgAll:string="";
	private msgCount:number = 0;
	/** 是否打印所有 */
	private isAll:Boolean = false;

	private static _ins: LogCtrl;
	public static get ins(): LogCtrl {
		if (!this._ins)
		LogCtrl._ins = new LogCtrl();
		return this._ins;
	}
	constructor() {
		if (LogCtrl._ins != null)
			throw new Error("LogCtrl is single!");
		this.arrMsg = [];
	}
	public resetLog():void{
		if(!this.isCanLog())
			return;
		//接管console.log
		console.log = (...data:any[])=>{
			this.log(data);
		}
		// console.error = (...data:any)=>{
		// 	this.log(data);
		// }
	}
	public init():void{
		if(!this.isCanLog())
			return;
		this.btnSkin = "data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAASAAD/4QNOaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0MiA3OS4xNjA5MjQsIDIwMTcvMDcvMTMtMDE6MDY6MzkgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjlBREM0MzY3RDk5NzExRUJBNDQ4RDE0Q0Y3OENEQTI0IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjlBREM0MzY2RDk5NzExRUJBNDQ4RDE0Q0Y3OENEQTI0IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjhjMmE1ODQ4LTEzYWMtMmE0Ny05YTZjLWI3YWNiYTFlMDRkZCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjhjMmE1ODQ4LTEzYWMtMmE0Ny05YTZjLWI3YWNiYTFlMDRkZCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pv/uAA5BZG9iZQBkwAAAAAH/2wCEABMPDxcQFyQVFSQtIxwjLSojIiIjKjgwMDAwMDhCOzs7Ozs7QkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkIBFBcXHRkdIxgYIzEjHSMxQDEnJzFAQkA8MDxAQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQv/AABEIAAUABQMBIgACEQEDEQH/xABMAAEBAAAAAAAAAAAAAAAAAAAAAwEBAQAAAAAAAAAAAAAAAAAAAQIQAQAAAAAAAAAAAAAAAAAAAAARAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJgBT//Z";
		//日志按钮
		this.btn =  this.createBtn("日志",Define.canvasWidth - this.btnW,Define.DeviceH - 300,this.showConsole,[true]);
		Global.root_top.addChild(this.btn);

		//日志内容
		this.ui = new Laya.Sprite();
		this.ui.graphics.drawRect(0,0,Define.canvasWidth,Define.DeviceH,"#ffffff");
		Global.root_top.addChild(this.ui);
		this.ui.visible = false;

		let btnY:number = Define.DeviceH-300;
		//所有
		this.btnMsgAll = this.createBtn("所有",0,btnY,this.showLog,["btnMsgAll"]);
		this.ui.addChild(this.btnMsgAll);
		//部分
		this.btnMsg = this.createBtn("部分",this.btnMsgAll.x + this.btnW+10,btnY,this.showLog,["btnMsg"]);
		this.ui.addChild(this.btnMsg);
		//清理
		this.btnClear = this.createBtn("清理",this.btnMsg.x + this.btnW+10,btnY,this.showLog,["btnClear"]);
		this.ui.addChild(this.btnClear);
		//隐藏
		this.btnHide = this.createBtn("隐藏",this.btnClear.x + this.btnW+10,btnY,this.showConsole,[false]);
		this.ui.addChild(this.btnHide);
		//日志
		this.txt = new Laya.Text();
		this.txt.color = "#000000";
		this.txt.font = "SimHei";
		this.txt.fontSize = 40;
		this.txt.wordWrap = true;
		this.txt.mouseEnabled = true;
		this.txt.overflow = Laya.Text.SCROLL;
		this.txt.x = 50;
		this.txt.size(Define.canvasWidth-this.txt.x*2,this.btnClear.y-50);
		this.txt.on(Laya.Event.MOUSE_DOWN, this, this.startScrollText);
		this.ui.addChild(this.txt);
	}
	private createBtn(lbl:string,x:number,y:number,func:Function,funcParam:Array<any>=null):Laya.Button{
		let btn:Laya.Button = new Laya.Button(this.btnSkin,lbl);
		btn.width = this.btnW;
		btn.height= this.btmH;
		btn.labelSize = 40;
		btn.x = x;
		btn.y = y;
		btn.on(Laya.Event.CLICK,this,func,funcParam);
		return btn;
	}
	public showConsole(v:boolean):void{
		this.ui.visible = v;
	}
	public showLog(name:string,evt:Laya.Event):void{
		let msg:string = name =="btnMsgAll"?this.msgAll:name =="btnMsg"?this.msg:"" ;
		this.txt.text = msg;
	}
	/**
	 * 打印日志
	 * @param data 
	 */
	public log(...data:any[]): void {
		if(this.isCanLog()){
			let msg:string=data.toString();

			this.msgAll  += msg;
			this.arrMsg.push(msg);
			if(this.arrMsg.length>20){
				this.arrMsg.shift();
			}
			this.msg = this.arrMsg.toString();
			if(this.txt)
			this.txt.text += msg+"\n\n";
		}
		
	}


	private startScrollText(){
		this.prevY = this.txt.mouseY;
		Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.scrollText);
		Laya.stage.on(Laya.Event.MOUSE_UP, this, this.finishScroll);
	}
	private finishScroll(){
		Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.scrollText);
		Laya.stage.off(Laya.Event.MOUSE_UP, this, this.finishScroll);
		// if(this.msg.y>0)this.msg.y=0;
		// if(this.msg.y< -this.msg.displayHeight)this.msg.y= -this.msg.displayHeight;
	}
	private scrollText(){
		var nowY=this.txt.mouseY;
		this.txt.scrollY += this.prevY-nowY;  //控制上下滑动
		this.prevY = nowY;
	}
	/** 是否可打印 本地调试不需要*/
	private isCanLog():boolean{return false;
		if(CustomDefine.environment == Environment.DEBUG || CustomDefine.environment == Environment.TEST){
			return true;
		}
		return false;
	}
}