import { ui } from "../../ui/layaMaxUI";
import {Struct_MinRank } from "../../custom/config/Struct";
import { UserData } from "../user/UserData";
import { CustomDefine } from "../../custom/CustomDefine";
import { UserCtrl } from "../user/UserCtrl";
import { GameCtrl } from "../GameCtrl";
import GameConfig from "../../GameConfig";
import { HttpManager } from "../../manager/HttpManager";
import { LocalStorage, LOCKSTORAGEKEY } from "../LocalStorage";
/**
 * 挖矿排行
 * 2021-06-03 andy
 * type:n:4,treasure_id:s:1402166891300093952
 */
export default class MinRankUI extends BaseWindow {
    private menuIndex:number=1;
    private productId:number = 0;
    /** 今日挖到的凸币 */
    private todayGold:number = 0;
    /** 当前菜单的凸币 */
    private gold:number = 0;
    /** 今日排行刷新时间间隔 单位毫秒 暂定10分钟*/
    private refreshTime:number = 600000;

    public ui:ui.min.MinRankUI;
    constructor(){
        super(ui.min.MinRankUI); 
    }
    public init():void{
        this.ui= this.view as ui.min.MinRankUI;
        
        this.ui.imgBg.skin = "res/atlas/not/bg_min_rank.png";
        this.ui.imgBg.x = 61
        this.ui.imgBg.y = 292;

        // 使用但隐藏滚动条,这个不设置不会滚动
        this.ui.lst.vScrollBarSkin = "";
        this.ui.lst.selectEnable = true;
        this.ui.lst.selectHandler = new Laya.Handler(this, this.onSelect);
        this.ui.lst.renderHandler = new Laya.Handler(this, this.updateItem);

        this.ui.lst.array = [];
        
    }

    public open():void{
        super.open();
        GameCtrl.ins.addBlackBg(this,0);
        EventManager.ins.on(CustomDefine.EVENT_MIN_RANK,this,this.EVENT_MIN_RANK);
        this.ui.txtName.text = UserData.ins.name;
        this.ui.imgHead.skin = UserData.ins.head;
        //每次打开获得一下今日挖矿数据
        let localGold:string = LocalStorage.getItem(LOCKSTORAGEKEY.haveGold);
        this.todayGold = UserData.ins.todayGold = localGold?parseFloat(localGold):0;
        this.showSelfGold(this.todayGold);
        
        this.ui.txtRank.visible = false;
        
        this.clickMenu(1);
    }

    public close():void{
        Laya.stage.off(Laya.Event.CLICK,this,this.stageClick);
        Laya.timer.clearAll(this);
        GameCtrl.ins.addBlackBg(null);
    }
    public viewClick(sp:Laya.Sprite):void{
        super.viewClick(sp);
        let spName:string=sp.name;
        if(spName.indexOf("btn_menu")>=0){
            let mindex:number = Number(spName.replace("btn_menu",""));
            this.clickMenu(mindex);
            GameCtrl.ins.playBtnSound();
            return;
        }
        switch(spName){
            case "":
               
            break;
            default:
            break;
        }
    }
    
    
    private stageClick():void{

    }

    //排行数据
    private EVENT_MIN_RANK():void{
        this.showSelfGold(0);
        let arrRank:Array<Struct_MinRank>= UserData.ins.getMinRankByType(this.menuIndex);
        for(let i=1;i<4;i++){
            this.ui["btn_menu"+i].visible = i!=this.menuIndex ;
        }
        this.ui.lst.array = arrRank;
        // if(menuIndex ==1){
        //     //是否上榜
        //     if(UserData.ins.selfMinRank){
        //         this.ui.txtRank.text = "第"+UserData.ins.selfMinRank.id+"名";
        //         this.ui.txtGold.text = UserData.ins.selfMinRank.gold+"";
        //     }else{
        //         this.ui.txtRank.text = "未上榜";
        //     }
        // }

        if(this.menuIndex == 1){
            this.showSelfGold(this.todayGold);
        }
    }
    private clickMenu(menuIndex:number):void{
        this.menuIndex = menuIndex;
        //2021-06-30 andy 上周 上月 不在榜单的无数据
        this.ui.imgHead.visible = this.ui.txtName.visible = this.ui.imgGold.visible = this.ui.txtGold.visible = menuIndex==1;
        if(menuIndex==1){
            //日排行 每次点击请求
            UserCtrl.ins.getMinRank(1);
            
        }else{
            let arrRank:Array<Struct_MinRank>= UserData.ins.getMinRankByType(menuIndex);
            if(arrRank){
                this.EVENT_MIN_RANK();
            }else{
                //如果没有数据
                UserCtrl.ins.getMinRank(menuIndex);
            }
        }
    }
 
    private updateItem(cell: ui.min.ItemMinRankUI, index: number): void {
        let rank:Struct_MinRank = this.ui.lst.array[index];
        //cell.txtIndex.text = rank.id+"";
        cell.imgHead.skin = rank.head;
        cell.txtName.text = rank.name.length>5?rank.name.substring(0,5)+"...":rank.name;
        //宝箱数量若是0，则不显示
        cell.spPrize1.visible = false;
        cell.spPrize2.visible = false;
        cell.spPrize3.visible = false;
        cell.imgBox.visible = false;
        cell.txtLucky.visible = false;
        //上周 上月   
        if(this.menuIndex>1){
            cell.imgBox.visible = cell.txtLucky.visible =rank.boxCount>0;
            if(cell.imgBox.visible){
                //宝箱数量大于10，两位表示
                if(rank.boxCount>=10){
                    cell.imgBox.skin = "mining/img_rank_box2.png";
                    cell.imgGe.visible =true;
                    cell.imgShi.skin = "mining/img_number"+(Math.floor(rank.boxCount/10))+".png";
                    cell.imgGe.skin = "mining/img_number"+(rank.boxCount%10)+".png";
                }else{
                    cell.imgBox.skin = "mining/img_rank_box1.png";
                    cell.imgShi.skin = "mining/img_number"+rank.boxCount+".png";
                    cell.imgGe.visible =false;
                }
                
                cell.txtLucky.text = "运气爆棚，挖到的实物奖品价值"+rank.boxValue+"凸币";
            } 
            //
            cell.txtGold.y = cell.imgGold.y = 30;
            cell.txtName.y = cell.height>>1;//45;
            //2021-06-26 切换上周 上月，显示
            if(rank.id == HttpManager.ins.uid){
                this.showSelfGold(rank.gold);
            }
        }else{
            let i:number=0;
            for(let prize of rank.arrPrize){
                i++;
                cell["spPrize"+i].visible = true;
                cell["imgItem"+i].skin = prize.icon;
                cell["imgStatus"+i].visible = false;
            }
            cell.txtName.y = cell.txtGold.y = cell.imgGold.y = cell.height>>1;
            
        }
        
        cell.txtGold.text = rank.gold+"";
        this.sortX(cell);
    }
    private sortX(cell: ui.min.ItemMinRankUI):void{
        let txtGoldX:number = cell.txtGold.x-cell.txtGold.displayWidth;
        cell.imgGold.x = txtGoldX-34;

        cell.imgBox.x = cell.imgGold.x - cell.imgBox.width - 8;
        cell.spPrize1.x = cell.imgGold.x - cell.spPrize1.width - 4;
        cell.spPrize2.x = cell.spPrize1.x - cell.spPrize1.width - 4;
        cell.spPrize3.x = cell.spPrize2.x - cell.spPrize1.width - 4;
    }

    private showSelfGold(gold:number):void{
        this.ui.txtGold.text = gold+"";
        this.ui.imgGold.x = this.ui.txtGold.x -this.ui.txtGold.displayWidth-5;
    }

    private onSelect(index: number): void {
        console.log("当前选择的索引：" + index);
        let rank:Struct_MinRank = this.ui.lst.array[index];
        
    }

    /** 刷新今日挖矿排行数据 */
    private refreshToday():void{
        //和今日排行榜前一个名次比较，如果超过刷新一下
        if(this.menuIndex == 1){
            if(UserData.ins.selfMinRank && UserData.ins.selfMinRank.index>1){
                let prevRank:Struct_MinRank = UserData.ins.arrMinRank1[UserData.ins.selfMinRank.index-2];
                if(this.todayGold>prevRank.gold){
                    UserData.ins.arrMinRank1=null;
                    console.log("挖矿今日排行超越刷新",this.todayGold,prevRank.gold);
                }
    
            }
         
            //距离上次刷新时间超过 规定时间，刷新一下
            if(Laya.timer.currTimer -UserData.ins.lastMinGetTime>this.refreshTime ){
                UserData.ins.arrMinRank1=null;
                UserData.ins.lastMinGetTime = Laya.timer.currTimer;
                console.log("挖矿今日排行定时刷新");
            }
        }
        
    }

}