using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FruitDelivery
{
    public class Math
    {
        public int lastSum;
        public int LastSum { get { return lastSum; } set { lastSum = value; } }

        Math(int lastSum) {
            this.lastSum = lastSum;
        }

        public int Add(int x, int y) {
            int sum;
            sum = x + y;
            return sum;
        }

        public int Multiply(int x, int y) {
            return x * y;
        }
    }
}
