import { ui } from "../../ui/layaMaxUI";
import {Struct_MinRank, Struct_MinRecord, Struct_MinRecordPrize } from "../../custom/config/Struct";
import { UserData } from "../user/UserData";
import { CustomDefine } from "../../custom/CustomDefine";
import { UserCtrl } from "../user/UserCtrl";
import { GameCtrl } from "../GameCtrl";
import GameConfig from "../../GameConfig";
import { AppCtrl } from "../AppCtrl";
import { CustomWindow } from "../../custom/ui/CustomWindow";
import { Test } from "../Test";
/**
 * 挖矿记录
 * 2021-06-04 andy
 */
export default class MinRecordUI extends BaseWindow {
    private menuIndex:number=1;
    private productId:string="";
    /** 兑换和记录总高度*/
    private lstHeight:number = 0;
    /** 兑换和记录间隔高度*/
    private lstMargin:number = 0;

    /** 兑换列表偏差*/
    private lstExchangeOff:number = 0;
    /** 记录列表偏差*/
    private lstRecordOff:number = 0;

    public ui:ui.min.MinRecordUI;
    constructor(){
        super(ui.min.MinRecordUI); 
    }
    public init():void{
        this.ui= this.view as ui.min.MinRecordUI;
        this.ui.imgBg.skin = "res/atlas/not/bg_min_record.png";
        this.ui.imgBg.y = Define.DeviceH - 1340;
        //this.ui.cacheAs = "none";
        this.ui.mask = null;
  

        //现在编辑器调整好初始位置，程序会自动计算
        this.lstHeight = this.ui.spRecord.y+this.ui.spRecord.height - this.ui.spExchange.y;
        this.lstMargin = this.ui.spRecord.y - this.ui.spExchange.y -this.ui.spExchange.height;

        this.lstExchangeOff = this.ui.imgExchangeBg.height - this.ui.lstExchange.height;
        this.lstRecordOff = this.ui.imgRecordBg.height - this.ui.lst.height;

        
        // 兑换不会滚动，有几个显示几个
        //this.ui.lstExchange.vScrollBarSkin = "";
        this.ui.lstExchange.selectEnable = true;
        this.ui.lstExchange.selectHandler = new Laya.Handler(this, this.onSelectExchange);
        this.ui.lstExchange.renderHandler = new Laya.Handler(this, this.updateItemExchange);

        // 使用但隐藏滚动条,这个不设置不会滚动
        this.ui.lst.vScrollBarSkin = "";
        this.ui.lst.selectEnable = true;
        this.ui.lst.selectHandler = new Laya.Handler(this, this.onSelect);
        this.ui.lst.renderHandler = new Laya.Handler(this, this.updateItem);

        this.ui.lst.array = [];
    }

    public open():void{
        super.open();
        GameCtrl.ins.addBlackBg(this,1);
        EventManager.ins.on(CustomDefine.EVENT_MIN_RECORD,this,this.EVENT_MIN_RECORD);
        EventManager.ins.on(CustomDefine.EVENT_APP_CONVERT,this,this.EVENT_APP_CONVERT);
        this.ui.spClose.alpha=0;
        this.ui.spClose.on(Laya.Event.CLICK,this,()=>{
            UIManager.ins.closeWindow(CustomWindow.minRecord);
            //Test.ins.initMinNotice();
        })
        
        
        if(UserData.ins.isGetRecordToday){
            this.EVENT_MIN_RECORD();
        }else{
            UserCtrl.ins.getMinRecord();
        }
    }

    public close():void{
        Laya.stage.off(Laya.Event.CLICK,this,this.stageClick);
        Laya.timer.clearAll(this);
        GameCtrl.ins.addBlackBg(null);
    }
    public viewClick(sp:Laya.Sprite):void{
        super.viewClick(sp);
        let spName:string=sp.name;

        switch(spName){
            case "btnShop":
                AppCtrl.ins.goExchange(this.productId);
                break;
            default:
            break;
        }
    }
    
    
    private stageClick():void{

    }
    private EVENT_APP_CONVERT(evt:NoticeEvent):void{
        UserData.ins.isGetRecordToday = false;
        UserCtrl.ins.getMinRecord();
    }

    //排行数据
    private EVENT_MIN_RECORD(evt:NoticeEvent=null):void{
        let arrPrize:Array<Struct_MinRecordPrize> = UserData.ins.getMinRecordPrize();
        if(arrPrize && arrPrize.length>0) { 
            this.ui.lstExchange.height = arrPrize.length *140+(arrPrize.length-1)*this.ui.lstExchange.spaceY;
            this.ui.imgExchangeBg.height = this.ui.lstExchange.height +this.lstExchangeOff;
            this.ui.spExchange.height = this.ui.imgExchangeBg.height;
            this.ui.lstExchange.array = arrPrize;

            this.ui.spExchange.visible = true;
            this.ui.spRecord.y = this.ui.spExchange.y+this.ui.spExchange.height+this.lstMargin;
            this.ui.spRecord.height = this.lstHeight-this.ui.spExchange.height - this.lstMargin;
            this.ui.imgRecordBg.height = this.ui.spRecord.height;
            this.ui.lst.height = this.ui.spRecord.height - this.lstRecordOff;
        }else{
            this.ui.spExchange.visible = false;
            this.ui.spRecord.y = this.ui.spExchange.y;

            this.ui.imgRecordBg.height = this.lstHeight;
            this.ui.maskRecord.height = this.lstHeight;
            this.ui.lst.height = this.lstHeight - this.lstRecordOff;
        }
        let arrMinRecord:Array<Struct_MinRecord>= UserData.ins.getMinRecord();
        if(arrMinRecord){
            
            this.ui.lst.array = arrMinRecord;

            this.ui.lst.tweenTo(UserData.ins.minRecordMonthIndex,200);
        }else{
            //如果没有数据
            UserCtrl.ins.getMinRecord();
        }

        //2021-06-26 没有任何记录，显示一张图片
        if(arrMinRecord && arrMinRecord.length>0){
            this.ui.imgNoRecord.visible = false;
        }else{
            this.ui.imgNoRecord.visible = true;
        }

        this.ui.imgNoRecord.y = this.ui.spRecord.y+(this.ui.imgRecordBg.height>>1);
    }
 
    private updateItem(cell: ui.min.ItemMinRecordUI, index: number): void {
        let record:Struct_MinRecord = this.ui.lst.array[index];
        if(record.month_year!=""){//统计月份
            cell.spRecordMonth.visible = true;
            cell.spRecord.visible = false;
            
            cell.txtMonth.text = record.month+"";
            //2021-06-07 andy 不是今年的数据，月份后增加年份显示
            if(UserData.ins.minRecordYear != record.year){
                cell.txtYear.text = record.year+"";
                cell.txtYearWord.text = "月           年";
            }else{
                cell.txtYear.text = "";
                cell.txtYearWord.text = "月";
            }
            //月份两位坐标，要向后移动一点
            cell.txtYearWord.x = cell.txtMonth.displayWidth+16;
            cell.txtYear.x = cell.txtYearWord.x+44;
            //2021-06-25 小三角
            cell.imgMenuStatus.x = cell.txtYearWord.x+cell.txtYearWord.displayWidth+6.5;
            cell.imgMenuStatus.visible = cell.imgMenuBottom.visible = UserData.ins.minRecordMonth!= record.month_year;

            cell.txtMonthGold.text = record.gold+"";
            cell.txtMonthBox.text = record.count+"";
        }else{//记录
            cell.spRecordMonth.visible = false;
            cell.spRecord.visible = true;

            cell.txtMon.text = record.month+"";
            cell.txtDay.text = record.day+"";
            //2021-06-22 andy
            cell.txtMonWord.x = cell.txtMon.x+cell.txtMon.displayWidth+7;
            cell.txtDay.x  = cell.txtMonWord.x +cell.txtMonWord.displayWidth;
            cell.txtDayWord.x = cell.txtDay.x + cell.txtDay.displayWidth+7;
            //record.time=320;
            cell.txtTime.text = this.formatDate(record.time)+"";
            cell.txtCount.text = record.count +"";
            cell.txtHp.text = record.hp+"";
            cell.txtGold.text = record.gold+"";
            //文字描述透明度 0.6
            cell.spDesc.alpha = 0.6;

            cell.spPrize1.visible = false;
            cell.spPrize2.visible = false;
            cell.spPrize3.visible = false;
            let i:number=0; 
            //2021-06-25 服务端修改状态 0：有效，1：失效，2：已兑换
            if(record.arrPrize){
                for(let prize of record.arrPrize){
                    i++;
                    cell["imgItem"+i].skin = prize.icon;
                    cell["imgStatus"+i].visible = prize.status==2;
                    cell["spPrize"+i].visible = true;
                    if(prize.status==1){ 
                        //cell["imgItem"+i].gray=true;
                        cell["imgStatus"+i].visible = true;
                        cell["imgStatus"+i].getChildAt(0).visible=false;
                    }else{
                        //cell["imgItem"+i].gray=false;
                        cell["imgStatus"+i].visible = false;
                    }
                }
            }
            
        }
    }
    private onSelect(index: number): void {
        console.log("当前选择的索引：" + index);
        let record:Struct_MinRecord = this.ui.lst.array[index];
        //2021-06-07 如果选中的是月份条目，则打开当前月份
        if(record.month_year!="" && record.month_year!=UserData.ins.minRecordMonth){
            GameCtrl.ins.playBtnSound();
            UserData.ins.minRecordMonth = record.month_year;
            
            if(UserData.ins.isHaveMinRecordByMonth(record.month_year)){
                this.EVENT_MIN_RECORD();
            }else{
                UserCtrl.ins.getMinRecord(record.month_year);
            }
        }
    }

    private formatDate(time:number):string{
        let timeStr:string="";
        if(time>=60){
            timeStr = Math.floor(time/60).toFixed(0)+"时";
        }
        timeStr += time%60+"分";
        return timeStr;
    }
    
    //挖矿实物兑换=======
    private updateItemExchange(cell: ui.min.ItemMinExchangeUI, index: number): void {
        let prize:Struct_MinRecordPrize = this.ui.lstExchange.array[index];
        cell.itemIcon.skin = prize.icon;
        cell.txtName.text = prize.desc.length>18?prize.desc.substring(0,18)+"...":prize.desc;
        cell.txtPrice.text = ""+prize.price;
       
    }
    private onSelectExchange(index: number): void {
        console.log("当前选择的索引：" + index);
        if(index!=-1){
            let prize:Struct_MinRecordPrize = this.ui.lstExchange.array[index];
            AppCtrl.ins.goExchange(prize.id+"");
            this.ui.lstExchange.selectedIndex=-1;
        }
        
    }

}