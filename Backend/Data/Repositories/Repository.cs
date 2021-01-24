using Core;
using DAL.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System;

namespace DAL.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private ApplicationDbContext _context;

        public Repository(ApplicationDbContext context) => _context = context;

        public void Insert(T model) => _context.Set<T>().Add(model);
        public IEnumerable<T> GetAll() => _context.Set<T>();
        public T Find(Func<T, bool> x, params string[][] include)
        {
            if (include.Length == 0)
                return _context.Set<T>().FirstOrDefault(x);

            var set = _context.Set<T>().Include(string.Join('.', include[0]));
            if(include.Length > 1)
                include.Skip(1).ToList().ForEach(x => set = set.Include(string.Join('.', x)));
            return set.FirstOrDefault(x);
        }

        public T GetById(int id) => _context.Set<T>().Find(id);
        public void Delete(int id) => _context.Set<T>().Remove(GetById(id));
        public void Update(T model) => _context.Set<T>().Attach(model);
        public void Commit() => _context.SaveChanges();
    }
}
