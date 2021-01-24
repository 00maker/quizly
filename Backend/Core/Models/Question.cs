using System.Collections.Generic;

namespace Core.Models
{
    public class Question
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public bool IsMultiSelect { get; set; }

        public ICollection<Answer> Answers { get; set; }
    }
}
