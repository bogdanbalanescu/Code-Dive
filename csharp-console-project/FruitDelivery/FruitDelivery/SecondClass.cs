using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FruitDelivery
{
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
}
