import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {EventTrigger, EventTriggerType} from "UnityEngine.EventSystems";
import {Entry} from "UnityEngine.EventSystems.EventTrigger";
import {GameObject} from "UnityEngine";
import GameManager from "./GameManager";
import {UIZepetoPlayerControl} from "ZEPETO.Character.Controller";

export default class Coin extends ZepetoScriptBehaviour {

    public b:int;
    OnTriggerEnter() {
        console.log('OnTriggerEnter.');
        GameObject.Find("GameManager").GetComponent<GameManager>().increaseScore()
        this.gameObject.SetActive(false)
    }

}