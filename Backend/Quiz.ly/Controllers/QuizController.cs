using System;
using System.Collections.Generic;
using System.Linq;
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
                var quiz = JsonConvert.DeserializeObject<QuizDTO>(value.ToString(), new JsonSerializerSettings {
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                });

                if (_repo.Find(x => x.Uri == id) != null)
                    throw new Exception("Quiz with uri specified already exists!");

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
        public JsonResult Put(string id, [FromBody] string value)
        {
            try
            {
                var quiz = JsonConvert.DeserializeObject<QuizDTO>(value);

                if (_repo.Find(x => x.Uri == id) != null)
                    throw new Exception("Quiz with uri specified already exists!");

                _repo.Insert(new Quiz
                {
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
                return new JsonResult(new { success = true });
            }
            catch (Exception e)
            {
                return new JsonResult(new { success = false, error = e.Message });
            }
        }

        [HttpDelete("{id}")]
        public JsonResult Delete(string id)
        {
            try
            {
                var quiz = _repo.Find(x => x.Uri == id);
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
