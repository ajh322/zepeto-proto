import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import NewCarController from "./NewCarController";

export default class NewCarUserControl extends ZepetoScriptBehaviour {
    public m_Car:NewCarController; // the car controller we want to use
    public test:float;
    Awake()
    {
        // get the car controller
        this.m_Car = this.GetComponent<NewCarController>();
    }

    FixedUpdate()
    {
        // pass the input to the car!
        let car:NewCarController;
        car = this.GetComponent<NewCarController>();
        let h:float = 0;
        let v:float = 1;
        car.Move(h, v, v, 0);
    }


}