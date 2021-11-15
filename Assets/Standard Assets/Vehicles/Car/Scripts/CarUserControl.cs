using System;
using UnityEngine;
using UnityStandardAssets._2D;
using UnityStandardAssets.CrossPlatformInput;

namespace UnityStandardAssets.Vehicles.Car
{
    [RequireComponent(typeof (CarController))]
    public class CarUserControl : MonoBehaviour
    {
        private CarController m_Car; // the car controller we want to use


        private void Awake()
        {
            // get the car controller
            m_Car = GetComponent<CarController>();
        }

        private float a = 0;
        
        public void MoveUp()
        {
            a = 1;
            float h = 0;
            float v = 1;
            float handbrake = CrossPlatformInputManager.GetAxis("Jump");
            m_Car.Move(h, v, v, handbrake);
        }
        
        public void MoveDown()
        {
            
        }
        
        public void MoveLeft()
        {
            
        }
        
        public void MoveRight()
        {
        }

        void Start()
        {
            a = 1;
        }

        private void FixedUpdate()
        {
            // pass the input to the car!
            float h = CrossPlatformInputManager.GetAxis("Horizontal");
            float v = CrossPlatformInputManager.GetAxis("Vertical");
#if !MOBILE_INPUT
            float handbrake = CrossPlatformInputManager.GetAxis("Jump");
            m_Car.Move(h, a, v, handbrake);

            Debug.Log(h+":"+v);
#else
            m_Car.Move(h, v, v, 0f);
#endif
        }
    }
}
