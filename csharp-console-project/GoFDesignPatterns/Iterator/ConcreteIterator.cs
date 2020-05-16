namespace GoFDesignPatterns
{
    /// <summary>
    /// The 'ConcreteIterator' class
    /// </summary>
    class ConcreteIterator : Iterator
    {
        private ConcreteAggregate _aggregate;
        private int _current;

        // Constructor
        public ConcreteIterator(ConcreteAggregate aggregate)
        {
            _current = 0;
            this._aggregate = aggregate;
        }

        // Gets first iteration item
        public override object First()
        {
            return _aggregate[0];
        }

        // Gets next iteration item
        public override object Next()
        {
            if (_current < _aggregate.Count - 1)
            {
                return MoveToNextItem();
            }

            return null;
        }

        private object MoveToNextItem()
        {
            _current = _current + 1;
            return _aggregate[_current];
        }

        // Gets current iteration item
        public override object CurrentItem()
        {
            return _aggregate[_current];
        }
        // Gets whether iterations are complete

        public override bool IsDone()
        {
            return _current >= _aggregate.Count;
        }
    }
}
