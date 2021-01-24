using DAL.Interfaces;
using Core;

namespace DAL.Repositories
{
    public class QuizRepository : Repository<Core.Models.Quiz>, IQuizRepository
    {
        public QuizRepository(ApplicationDbContext context) : base(context) {}
    }
}
