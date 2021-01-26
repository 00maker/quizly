using System.Collections.Generic;

namespace Core.Models
{
    public class QuizResult
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public int CorrectAnswers { get; set; }

        [System.Text.Json.Serialization.JsonIgnore]
        public Quiz Quiz { get; set; }
        public ICollection<Answer> Answers { get; set; }
    }
}
