using System.Collections.Generic;

namespace Core.Models
{
    public class Answer
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public bool Correct { get; set; }
        public int SelectedCount { get; set; }

        public ICollection<QuizResult> Results { get; set; }
    }
}
