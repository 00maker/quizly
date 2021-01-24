using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Models
{
    [Table("Quizzes")]
    public class Quiz
    {
        public int Id { get; set; }
        public string Uri { get; set; }
        public string Name { get; set; }
        public string Author { get; set; }

        public int FinishedCount { get; set; }

        public ICollection<Question> Questions { get; set; }
        public ICollection<QuizResult> Results { get; set; }
    }
}
