import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {UIZepetoPlayerControl} from "ZEPETO.Character.Controller";
import {Camera, GameObject, Vector2} from "UnityEngine";
import {Text} from 'UnityEngine.UI';

export default class GameManager extends ZepetoScriptBehaviour {

    public b:int;
    
    public textScore:Text;
    public score:int;
    camera:Camera;
    uIZepetoPlayerControl:UIZepetoPlayerControl;
    
    Start() {
        this.score=0
    }

    Update()
    {
        this.uIZepetoPlayerControl = GameObject.FindObjectOfType<UIZepetoPlayerControl>()
        if(this.uIZepetoPlayerControl) {
            this.uIZepetoPlayerControl.StartMoving()
            this.uIZepetoPlayerControl.Move(new Vector2(10,0));
        }
    }
    
    //초기화
    init()
    {
        //카메라 찾기
        //캐릭터 찾기
    }
    
    //캐릭터 움직이기
    moveCharacter()
    {
        
    }
    
    //카메라 안움직이도록 하기
    refreshCameraPosition()
    {
        //x,1.035,-5
    }
    
    //동전먹음
    increaseScore()
    {
        this.textScore.text=(++this.score).toString()
    }
}