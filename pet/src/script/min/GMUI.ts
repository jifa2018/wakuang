import { HttpManager, HttpMethod, HttpName } from "../../manager/HttpManager";
import { ui } from "../../ui/layaMaxUI";
import { LocalStorage } from "../LocalStorage";


export class GMUI extends ui.min.GMUI {

    constructor() {
        super();
        LayerManager.ins.addChild(this, LayerName.top);
        this.btn_select.on(Laya.Event.CLICK, this, this.onSelect)
    }

    onSelect() {
        let _JSON = { user_id: HttpManager.ins.uid };
        let str: any = this.gm.text;

        if (str == "") return

        let arr = str.split(",");

        arr.forEach(element => {
            let _arr = element.split(":");
            if (_arr[1] == "n") {
                _JSON[_arr[0]] = Number(_arr[2])
            } else {
                _JSON[_arr[0]] = _arr[2].toString()
            }

        });
        this.gm.text = "";
        console.log("修改参数", JSON.stringify(_JSON))

        HttpManager.ins.sendMsg(HttpName.ASSIGN, _JSON, HttpMethod.POST, (msg: string, method: string, e) => {

        });

        if (!Laya.Browser.onMobile) {
            this.removeSelf();
            this.destroy();
        }


    }
}
