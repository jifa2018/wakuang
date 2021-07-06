import { NOTICETYPE, RUNTYPE } from "./BaseNotice";

/**信息数据 */
export class PublicNoticeData {
    type: NOTICETYPE;
    runType: RUNTYPE;
    url: any;
    content: any;
    runTime: number = 0;
    stopTime: number = 0
    onInit(data) {
        this.type = data.typ;
        this.runType = data.play_type;
        this.url = data.url;
        this.content = data.text
        this.runTime = data.play_time;
        this.stopTime = data.static_time
    }

}