using System;
using System.A.B.C;

namespace CodeDive {

    // public enum ProgressState : int {
    //     BEGINNING,
    //     INTHEMIDDLE,
    //     FINISHED
    // }

    // public interface IName : IW, IX
    // {
    //     int X { get; set; }
    //     int Method (int x, float y);
    // }

    // public struct MyStruct {
    //     public int X { get; set; }
    // }

    public class MagicTrick
    {
        private string secret;
        public string Name { get; set; }

        MagicTrick(string name) {
            Name = name;
        }

        public int ApplyMagic(int x) {
            Math math;
            math = new Math();
            return x * math.MagicNumber;
        }
    }

    public class Math
    {
        public int MagicNumber { get; set; }

        public int Add(int x, int y) {
            int sum;
            sum = x + y;
            return sum;
        }

        public int Multiply(int x, int y) {
            return x * y;
        }
    }

    /*public class Example {
        public int x;
        protected sealed int[] y;
        protected sealed Machine Machine { get; set; }
        public Example() {}
        public Example (int x, out int y) 
        {
            this.X = x;
            int[] randomNumbers;
            string message;
            Machine.Start(randomNumber, message);
            this.ProcessMessage(message);
            randomNumber = Machine.Start(2 + 3, message);
            message = new String("241", message[2]);
            y.z = new int[index + 2];
            y[1] = methodCall() + otherResult;
            z = y[2];
            if (x <= 3)
                ComputeSum(z.q[3]);
            else
                ComputeCount(y);
            x <<= 1;
            while (7 + ye())
                x(49);
            do flipOver(); while (notTired());
            for (x = 1; x < 2; x = x + 1)
                Write(x);
            foreach (int w in randomNumbers)
                Write(w);
			try
			{
				x = ImpossibleTask();
			}
			catch (Exception ex)
			{
				throw ex;
			}
			finally
			{
				x = PossibleTask();
			}
        }

        public override int Add(int x, int y) 
        {
            return x + y;
        }
    }*/
}