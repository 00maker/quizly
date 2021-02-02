using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Pipelines;
using System.Linq;
using System.Threading.Tasks;
using Core.Models;
using DAL.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Quizly.Models;

namespace Quizly.Controllers
{
    [Route("quiz")]
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly IQuizRepository _repo;

        public QuizController(IQuizRepository repo) => _repo = repo;

        public JsonResult Get() => new JsonResult(_repo.GetAll().ToArray());

        [HttpGet("{id}")]
        public JsonResult Get(string id)
        {
            try
            {
                var quiz = _repo.Find(x => x.Uri == id, new string[] { "Questions", "Answers" });
                if (quiz == null) throw new Exception("Quiz with uri specified doesn't exist!");
                return new JsonResult(quiz);
            }
            catch (Exception e)
            {
                return new JsonResult(new { success = false, error = e.Message });
            }
        }

        [HttpGet("results/{id}")]
        public JsonResult GetResults(string id)
        {
            try
            {
                var quiz = _repo.Find(x => x.Uri == id, new string[] { "Results" });
                if (quiz == null) throw new Exception("Quiz with uri specified doesn't exist!");
                return new JsonResult(quiz.Results.OrderByDescending(x => x.CorrectAnswers).ToArray());
            }
            catch (Exception e)
            {
                return new JsonResult(new { success = false, error = e.Message });
            }
        }

        [HttpPost("create/{id}")]
        public JsonResult Post(string id, [FromBody] object value)
        {
            try
            {
                var quiz = JsonConvert.DeserializeObject<QuizDTO>(value.ToString());

                if (string.IsNullOrEmpty(quiz.uri) && quiz.uri.All(x => char.IsLetterOrDigit(x))) throw new Exception("You must specift correct id.\nOnly letters and digits are allowed.");

                if (_repo.Find(x => x.Uri == id) != null)
                    throw new Exception("Quiz with uri specified already exists!");

                if (quiz.questions.Length <= 0) throw new Exception("Quiz must contain at least one question.");

                _repo.Insert(new Quiz {
                    Name = quiz.title,
                    Author = quiz.author,
                    Uri = quiz.uri,
                    Questions = quiz.questions.Select(x => new Question
                    {
                        Text = x.question,
                        IsMultiSelect = x.answers.Count(x => x.isCorrect) > 1,
                        Answers = x.answers.Select(y => new Answer
                        {
                            Correct = y.isCorrect,
                            Text = y.answer,
                        }).ToArray(),
                    }).ToArray()
                });
                _repo.Commit();

                return new JsonResult(new { success = true });
            }
            catch (Exception e)
            {
                return new JsonResult(new { success = false, error = e });
            }
        }

        [HttpPost("{id}")]
        public JsonResult PostResult(string id, [FromBody] object value)
        {
            try
            {
                var data = JsonConvert.DeserializeObject<QuizResultDTO>(value.ToString());
                var quiz = _repo.Find(x => x.Uri == id, new string[] { "Questions", "Answers" }, new string[] { "Results" });
                if (quiz == null) throw new Exception("Quiz with uri specified doesn't exists!");

                var quizAnswers = Enumerable.Range(0, quiz.Questions.Count)
                    .Select(x => quiz.Questions.ElementAt(x).Answers.First(y => data.answerIds[x].Contains(y.Id)));

                quizAnswers.ToList().ForEach(x => ++x.SelectedCount);

                quiz.Results?.Add(new QuizResult {
                    Answers = quizAnswers.ToList(),
                    CorrectAnswers = quizAnswers.Count(x => x.Correct),
                    Username = data.username
                });

                ++quiz.FinishedCount;
                _repo.Update(quiz);
                _repo.Commit();

                return new JsonResult(new { success = true });
            }
            catch (Exception e)
            {
                return new JsonResult(new { success = false, error = e.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<JsonResult> Put(int id)
        {
            try
            {
                string newName = null;
                using (var sr = new StreamReader(Request.Body))
                    newName = await sr.ReadToEndAsync();

                var quiz = _repo.GetById(id);
                if (quiz == null)
                    throw new Exception("Quiz with uri specified doesn't exists!");

                if (string.IsNullOrEmpty(newName))
                    throw new Exception("Name shouldn't be empty!");

                _repo.Update(quiz).Name = newName;
                _repo.Commit();
                
                return new JsonResult(new { success = true });
            }
            catch (Exception e)
            {
                return new JsonResult(new { success = false, error = e.Message });
            }
        }

        [HttpDelete("{id}")]
        public JsonResult Delete(int id)
        {
            try
            {
                var quiz = _repo.Find(x => x.Id == id, new string[] { "Questions", "Answers" }, new string[] { "Results" });

                if (quiz == null)
                    throw new Exception("Quiz with uri specified doesn't exist!");

                _repo.Delete(quiz.Id);
                _repo.Commit();

                return new JsonResult(new { success = true });
            }
            catch (Exception e)
            {
                return new JsonResult(new { success = false, error = e.Message });
            }
        }
    }
}
