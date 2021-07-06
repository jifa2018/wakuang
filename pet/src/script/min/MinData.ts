import { HttpManager, HttpMethod, HttpName } from "../../manager/HttpManager";
import { MinCtrl } from "./MinCtrl";

//数据层
export class MinData {
    //体力
    private labour: number = 23 //0;
    //矿币数量
    private zMinCion: number = 0;
    //剩余矿币
    private sMinCion: number = 0;
    //广告位
    private advert: string = "mining/bg.jpg" //"";
    //挖矿时间
    private nTime: number = 0;
    //体力消耗
    private nExpended: number = 0;
    //状态
    private nState: number = 0; //0：没进入矿洞，1：正常， 2：矿洞结束， 3：没体力，4：挖空
    //我获得凸币
    private nReward: number = 0;
    //宝藏物品
    private oTreasure_infos = [];
    //我的宝藏
    private ownTreasure_infos = [];
    //挖矿频率（单位：秒）
    private frequency: number = 0;
    //剩余的体力
    private remaining_power: number = 0;

    //当前矿洞人量信息
    private minCrowd = {
        crowdsIcon: [],
        crowdsCount: 320
    }

    //vip 信息
    private vipLv: number = 3// 0;
    //数据
    private data: any;

    private static _ins: MinData;
    public static get ins(): MinData {
        if (!this._ins)
            MinData._ins = new MinData();
        return this._ins;
    }

    constructor() {

    }

    //获取远程数据，更新数据
    getData() {

    }

    //更新所有数据
    upDate(e) {
        //获取
        // 
        if (Object.keys(e.data).length <= 0) return

        this.setzMinCion(e.data.total_coin);
        this.setsMinCion(e.data.balance);
        this.setLabour(e.data.total_power);
        this.setnTime(e.data.duration);
        this.setnExpended(e.data.expended);
        this.setRemainingPower(e.data.remaining_power)
        this.setnState(e.data.status);
        this.setMinCrowd({ crowdsIcon: e.data.users, crowdsCount: e.data.user_count });
        this.setnReward(e.data.reward);
        this.setoTreasure_infos(e.data.treasure_infos);
        this.setownTreasure_infos(e.data.treasure_infos);
        this.setFrequency(e.data.frequency);
    }

    clearData() {
        this.setzMinCion(0);
        this.setsMinCion(0);
        this.setLabour(0);
        this.setnTime(0);
        this.setnExpended(0);
        this.setRemainingPower(0)
        this.setnState(-999);
        this.setMinCrowd({});
        this.setnReward(0);
        this.setoTreasure_infos({});
        this.setownTreasure_infos([]);
        this.setFrequency(0);
    }

    setownTreasure_infos(arr: any) {
        this.ownTreasure_infos = []
        if (!arr || arr.length <= 0) return
        arr.forEach(element => {
            if (element.user_id == HttpManager.ins.uid) {
                this.ownTreasure_infos.push(element);
            }
        });
    }

    setRemainingPower(n: number) {
        this.remaining_power = n;
    }

    getRemainingPower() {
        return this.remaining_power
    }

    setFrequency(n: number) {
        this.frequency = n;
    }

    getFrequency() {
        return this.frequency
    }

    getownTreasure_infos() {
        return this.ownTreasure_infos
    }


    setoTreasure_infos(o: any) {
        this.oTreasure_infos = o;
    }

    getoTreasure_infos() {
        return this.oTreasure_infos
    }

    setnReward(n: number) {
        this.nReward = n;
    }

    getnReward() {
        return this.nReward
    }

    setnState(n: number) {
        this.nState = n;
    }

    getnState(): number {
        return this.nState
    }


    setnExpended(n: number) {
        this.nExpended = n;
    }

    getnExpended(): number {
        return this.nExpended
    }

    setnTime(n: number) {
        this.nTime = n;
    }

    getnTime(): number {
        return this.nTime
    }

    setLabour(n: number) {
        this.labour = n;
    }

    getLabour(): number {
        return this.labour
    }

    setzMinCion(n: number) {
        this.zMinCion = n;
    }
    getzMinCion(): number {
        return this.zMinCion;
    }

    setsMinCion(n: number) {
        this.sMinCion = n;
    }
    getsMinCion(): number {
        return this.sMinCion;
    }


    setAdvert(address: string) {
        this.advert = address;
    }

    getAdvert(): string {
        return this.advert;
    }

    setMinCrowd(obj: any) {
        this.minCrowd = obj;
    }
    getMinCrowd() {
        return this.minCrowd
    }

    setVipLv(n: number) {
        this.vipLv = n;
    }

    getVipLv(): number {
        return this.vipLv;
    }

}