import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {GameObject, Mathf, Quaternion, Rigidbody, Vector3, WheelCollider, WheelHit} from "UnityEngine";

export default class NewCarController extends ZepetoScriptBehaviour {

    public m_WheelColliders:WheelCollider[];
    public m_WheelMeshes:GameObject[];
    // public m_WheelEffects:WheelEffects[] = new WheelEffects[4];
    public m_CentreOfMassOffset:Vector3;
    public m_MaximumSteerAngle:float;
    public m_SteerHelper:float; // 0 is raw physics , 1 the car will grip in the direction it is facing
    public m_TractionControl:float; // 0 is no traction control, 1 is full interference
    public m_FullTorqueOverAllWheels:float;
    public m_ReverseTorque:float;
    public m_MaxHandbrakeTorque:float;
    public m_Downforce:float = 100;
    public m_Topspeed:float = 200;
    public static NoOfGears:int = 5;
    public m_RevRangeBoundary:float = 1;
    public m_SlipLimit:float;
    public m_BrakeTorque:float;

    private m_WheelMeshLocalRotations:Quaternion[];
    private m_Prevpos:Vector3
    private m_Pos:Vector3;
    private m_SteerAngle:float;
    private m_GearNum:int;
    private m_GearFactor:float;
    private m_OldRotation:float;
    private m_CurrentTorque:float;
    private m_Rigidbody:Rigidbody;
    private k_ReversingThreshold:float = 0.01;

    public Skidding:bool;
    public BrakeInput:float;

    public get CurrentSteerAngle()
    {
        return this.m_SteerAngle;
    }
    public get CurrentSpeed()
    {
        return this.m_Rigidbody.velocity.magnitude*2.23693629;
    }
    
    public get MaxSpeed()
    {
        return this.m_Topspeed;
    }
    public Revs:float;
    public AccelInput:float;

    Awake()
    {
        this.m_Rigidbody = this.GetComponent<Rigidbody>();
        this.m_CurrentTorque = this.m_FullTorqueOverAllWheels - (this.m_TractionControl*this.m_FullTorqueOverAllWheels);
    }

    Move(steering:float, accel:float, footbrake:float, handbrake:float)
    {
        for (let i = 0; i < 4; i++)
        {
            let quat:$Ref<Quaternion> = new class implements $Ref<Quaternion> {
                value: Quaternion;
            }
            let position:$Ref<Vector3> = new class implements $Ref<Vector3> {
                value: Vector3;
            };
            this.m_WheelColliders[i].GetWorldPose(position, quat);
            this.m_WheelMeshes[i].transform.position = position.value;
            this.m_WheelMeshes[i].transform.rotation = quat.value;
        }
    
        //clamp input values
        steering = Mathf.Clamp(steering, -1, 1);
        this.AccelInput = accel = Mathf.Clamp(accel, 0, 1);
        this.BrakeInput = footbrake = -1*Mathf.Clamp(footbrake, -1, 0);
        handbrake = Mathf.Clamp(handbrake, 0, 1);
        
        //Set the steer on the front wheels.
        //Assuming that wheels 0 and 1 are the front wheels.
        this.m_SteerAngle = steering*this.m_MaximumSteerAngle;
        this.m_WheelColliders[0].steerAngle = this.m_SteerAngle;
        this.m_WheelColliders[1].steerAngle = this.m_SteerAngle;
        
        // SteerHelper();
        this.ApplyDrive(accel, footbrake);
        this.CapSpeed();
        
        //Set the handbrake.
        //Assuming that wheels 2 and 3 are the rear wheels.
        if (handbrake > 0)
        {
            var hbTorque = handbrake*this.m_MaxHandbrakeTorque;
            this.m_WheelColliders[2].brakeTorque = hbTorque;
            this.m_WheelColliders[3].brakeTorque = hbTorque;
        }
        
        
        // CalculateRevs();
        // GearChanging();

        // AddDownForce();
        // CheckForWheelSpin();
        this.TractionControl();
    }
    
    ApplyDrive(accel:float, footbrake:float)
    {
        let thrustTorque:float;
        thrustTorque = accel * (this.m_CurrentTorque / 4);
        for (let i = 0; i < 4; i++)
            this.m_WheelColliders[i].motorTorque = thrustTorque;

        for (let i = 0; i < 4; i++)
        {
            if (this.CurrentSpeed > 5 && Vector3.Angle(this.transform.forward, this.m_Rigidbody.velocity) < 50)
            {
                this.m_WheelColliders[i].brakeTorque = this.m_BrakeTorque*footbrake;
            }
            else if (footbrake > 0)
            {
                this.m_WheelColliders[i].brakeTorque = 0;
                this.m_WheelColliders[i].motorTorque = -this.m_ReverseTorque*footbrake;
            }
        }
    }

    CapSpeed()
    {
        let speed:float = this.m_Rigidbody.velocity.magnitude;
        speed *= 2.23693629;
        
        let multiplier:float = this.m_Topspeed/2.23693629;
        if (speed > this.m_Topspeed)
            this.m_Rigidbody.velocity = new Vector3(this.m_Rigidbody.velocity.normalized.x*multiplier,this.m_Rigidbody.velocity.normalized.y*multiplier,this.m_Rigidbody.velocity.normalized.z*multiplier);
    }

    TractionControl()
    {
        let wheelHit:$Ref<WheelHit> = new class implements $Ref<WheelHit> {
            value: WheelHit;
        }
        for (let i = 0; i < 4; i++) {
            this.m_WheelColliders[i].GetGroundHit(wheelHit);
            this.AdjustTorque(wheelHit.value.forwardSlip);
        }
    }

    AdjustTorque(forwardSlip:float)
    {
        if (forwardSlip >= this.m_SlipLimit && this.m_CurrentTorque >= 0)
        {
            this.m_CurrentTorque -= 10 * this.m_TractionControl;
        }
        else
        {
            this.m_CurrentTorque += 10 * this.m_TractionControl;
            if (this.m_CurrentTorque > this.m_FullTorqueOverAllWheels)
            {
                this.m_CurrentTorque = this.m_FullTorqueOverAllWheels;
            }
        }
    }
    
}