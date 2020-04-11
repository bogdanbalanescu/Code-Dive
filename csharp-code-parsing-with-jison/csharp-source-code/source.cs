using System;
using System.A.B.C;

namespace CodeDive {
    public class Example {
        public int x;
        protected sealed int[] y;
        protected sealed Machine Machine { get; set; }
        public Example() {}
        public Example (int x, out int y) 
        {
            this.X = x;
            int[] randomNumber;
            string message;
            Machine.Start(randomNumber, message);
            this.ProcessMessage(message);
            randomNumber = Machine.Start(2 + 3, message);
            message = new String("241", message[2]);
            y.z = new int[index + 2];
            y[1] = 4;
            z = y[2];
            if (x <= 3)
                ComputeSum(z.q[3]);
            else
                ComputeCount(y);
            x <<= 1;
        }
    }
}