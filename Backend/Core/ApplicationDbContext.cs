using Core.Models;
using System.Data.Entity;

namespace Core
{
    public class ApplicationDbContext : DbContext
    {
        public virtual DbSet<Quiz> Quizzes { get; set; }
        public virtual DbSet<Question> Questions { get; set; }
        public virtual DbSet<QuizResult> QuizResults { get; set; }
        public virtual DbSet<Answer> Answers { get; set; }

        public ApplicationDbContext(string connectionString) : base(connectionString) { }
    }
}