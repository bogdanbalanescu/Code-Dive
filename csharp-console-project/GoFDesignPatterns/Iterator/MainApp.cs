using System;

namespace GoFDesignPatterns
{
    /// <summary>
    /// MainApp startup class for Structural 
    /// Iterator Design Pattern.
    /// </summary>
    class MainApp
    {
        /// <summary>
        /// Entry point into console application.
        /// </summary>
        static void Main()
        {
            ConcreteAggregate a = new ConcreteAggregate();
            a[0] = "Item A";
            a[1] = "Item B";
            a[2] = "Item C";
            a[3] = "Item D";

            // Create Iterator and provide aggregate
            Iterator i = a.CreateIterator();

            Console.WriteLine("Iterating over collection:");

            object item = i.First();
            while (item != null)
                item = WriteCurrentAndGetNext(i, item);

            // Wait for user
            Console.ReadKey();
        }

        private static object WriteCurrentAndGetNext(Iterator i, object item)
        {
            Console.WriteLine(item);
            item = i.Next();
            return item;
        }
    }
}
