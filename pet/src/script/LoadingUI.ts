import { ui } from "./../ui/layaMaxUI";
import { LoadingCtrl } from "./LoadingCtrl";
import { CustomDefine } from "../custom/CustomDefine";
import { Struct_Bag } from "../custom/config/Struct";
import { UserData } from "./user/UserData";
import { Test } from "./Test";
import { AppCtrl } from "./AppCtrl";

/**
 */
export default class LoadingUI extends BaseWindow {
    private loadIndex:number=0;
    private progressHandler:Laya.Handler;
    private arrScroll:Array<Laya.Image>;
    private frame:number=0;

    private arrLoad:Array<Function>;
    public ui:ui.LoadingUI;
    constructor(){
        super(ui.LoadingUI);
    }

    protected init():void{
        this.ui= this.view as ui.LoadingUI;
        this.arrScroll = [];
    } 
    public open():void{
        Base64Manager.isUseBase64 = false;
        this.ui.btnCloseApp.on(Laya.Event.MOUSE_DOWN,this,()=>{
            AppCtrl.ins.close();
        })
        this.progressHandler=Laya.Handler.create(this,this.HTTP_PROGRESS,null,false);      
        EventManager.ins.on(NoticeEvent.HTTP_PROGRESS,this,this.HTTP_PROGRESS);
        this.arrLoad=[this.loadRes,this.loadDataConfig]; 
        this.loadIndex=0;
        this.loadNext();

        let spMask:Laya.Sprite = new Laya.Sprite();
        spMask.graphics.drawRect(0,0,this.ui.spScroll.width,this.ui.spScroll.height,"");
        this.ui.spScroll.mask = spMask;

        for(let i=0;i<=20;i++){
            let img:Laya.Image = new Laya.Image("loading/img_loading_cell.png");
            img.x = i*50;
            this.arrScroll.push(img);
            this.ui.spScroll.addChild(img);
        }
        Laya.timer.frameLoop(1,this,this.scroll);

        //2021-06-26 andy loading界面不用显示
        this.ui.visible = false;
    }
    public close():void{
        Laya.timer.clearAll(this);
    }
    private scroll():void{
        for(let i=0;i<=20;i++){
            let img:Laya.Image = this.arrScroll[i];
            img.x+=4;
            if(img.x>this.ui.width+10){
                img.x =this.arrScroll[0].x-50;
                this.arrScroll.splice(i,1);
                this.arrScroll.unshift(img);
            }
        }
        this.frame++;
        if(this.frame%3==0){
            let a:number = this.frame/150*100;
            if(a>100){
                a=100;
                Laya.timer.clear(this,this.scroll);
                //加载时间过长，超过指定时间，自动进入游戏
                EventManager.ins.event(NoticeEvent.GAME_RES_LOAD_FINISH);
                Global.platform.login();
            }
            this.ui.txtCount.text = a.toFixed(0)+"%";
        }
    }  

    public loadNext():void{
        //console.log("loadIndex="+this.loadIndex);
        if(this.loadIndex>= this.arrLoad.length){
            console.log("资源加载结束。。");
            //加载结束
            EventManager.ins.event(NoticeEvent.GAME_RES_LOAD_FINISH);
            Global.platform.login();
        }else{
            let func=this.arrLoad[this.loadIndex++];
            if(func){
                func.call(this);
            }
        }
    }

    private loadDataConfig():void{
        LoadingCtrl.ins.preloadDataConfig(Laya.Handler.create(this,this.loadNext));
    }

    private loadRes():void{
        ResManager.ins.preload(LoadingCtrl.ins.arrRes,Laya.Handler.create(this,this.loadNext),this.progressHandler);
    }
    
    private loadSound():void{
        let arr=[{
            url:Define.CDN+CustomDefine.SOUND_MAIN,
            type:Laya.Loader.SOUND
        }];
        SoundManager.ins.preload(arr,Laya.Handler.create(this,this.loadNext),this.progressHandler)
    }


    public HTTP_PROGRESS(e:any):void{
        //console.log("Http_progress",e.data);
        let curProgress:number=Number(e.data);
        let progressValue:number=(this.loadIndex+curProgress)/this.arrLoad.length;
        //this.ui.bar.value = progressValue;
    }
}