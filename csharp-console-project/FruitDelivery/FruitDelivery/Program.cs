using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FruitDelivery
{
    class Program
    {
        static void Main(string[] args)
        {
            int x;
            int y;
            y = 22;
            x = 24 + y;
            Console.WriteLine("All good here");
        }
    }

    struct MyStruct
    {
        public int X { get; set; }
        public int Add(int x, int y)
        {
            return x + y;
        }
    }

    interface IKnowAll
    {
        int Knowledge { get; set; }
        void AwesomeFact();
    }

    enum Salutes {
        HiFive,
        AllGood
    }
}
