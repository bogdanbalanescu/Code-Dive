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
            int[] randomNumber;
            string message;
            Machine.Start(randomNumber, message);
            this.ProcessMessage(message);
            randomNumber = Machine.Start(2 + 3, message);
            message = new String("241", message);
            y = new int[index + 2];
        }
    }
}