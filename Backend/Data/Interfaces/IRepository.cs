using System;
using System.Collections.Generic;

namespace DAL.Interfaces
{
    public interface IRepository<T>
    {
        IEnumerable<T> GetAll();
        T GetById(int id);
        T Find(Func<T, bool> x, params string[][] include);
        void Insert(T model);
        void Delete(int id);
        void Update(T model);
        void Commit();
    }
}
