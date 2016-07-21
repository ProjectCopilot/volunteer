  "use strict";

  // Project Copilot Concierge Client
  // Copyright 2016 Project Copilot

  var HOSTNAME = "{HOSTNAME}";
  var PORT = "{PORT}";

    // Load questions
    $.getJSON("data/questions.json", function (questionList) {

          // initialize standard form variables on page load
          var helper = $("#helper");
          var mainInput = [
              $("#mainField"),
              $("#mainOption"),
              $("#mainTextArea")
          ];
          var inputJSON = {};
          var questionQueue = questionList.slice();
          var backStack = [];
          var currentQuestion = 0;
          var q_count = -1;
          var queueLength = questionQueue.length;
          var ix = getInputIndex(questionQueue[currentQuestion].type);
          var q_prev = '';
          var current = {};
          var prev = {};



          // return ix given type
          function getInputIndex(type) {
            if (type === "option") {
              return 1;
            } else if (type === "textarea") {
              return 2;
            } else {
              return 0;
            }
          }

          function validateQuestion(question, value) {
            var valid = false;
            if (question.validator == "contact") {
              valid = validate[question.validator](inputJSON[question.key == "referer_contact" ? "referer_contactMethod" : "contactMethod"], value);
            } else {
              valid = question.validator in validate ? validate[question.validator](value) : false;
            }

            return valid;
          }


          // Process current question and pull up next question
          function next() {

            helper.fadeOut(function() {
              if (currentQuestion < queueLength) {

                if (q_count > -1) $("#backButton").css("display", "inline-block");
                q_count++;

                helper.text(questionQueue[currentQuestion].helper);

                  // q_prev = currentQuestion !== 0 || _.isEqual(questionList, questionQueue) ? q_prev : "NONE";

                  var backObject = questionQueue[currentQuestion];
                  backObject["queue"] = questionQueue.slice();
                  // console.log("Next", questionQueue);
                  backObject["currentIndex"] = currentQuestion;
                  backObject["previousValue"] = q_prev;
                  backStack.push(backObject);

                // Is the question type an option or a textfield?
                ix = getInputIndex(questionQueue[currentQuestion].type);

                queueLength = questionQueue.length;

                if (ix == 1) {
                  mainInput[0].css("display", "none");
                  mainInput[1].css("display", "inline-block");
                  mainInput[2].css("display", "none");
                  $("#mainOption").html("<option value=\"\" id=\"optionHelper\" disabled selected>Option Placeholder</option>");
                  $("#optionHelper").text(questionQueue[currentQuestion].value);
                  for (var i = 0; i < questionQueue[currentQuestion].options.length; i++) {
                    mainInput[ix].append('<option value="'+questionQueue[currentQuestion].options[i]+'">'+questionQueue[currentQuestion].options[i]+'</option>');
                  }

                  if (questionQueue[currentQuestion].key in inputJSON) mainInput[ix].val(inputJSON[questionQueue[currentQuestion].key]);

                } else if (ix == 0) {
                  mainInput[0].css("display", "inline-block");
                  mainInput[1].css("display", "none");
                  mainInput[2].css("display", "none");
                  mainInput[ix].val("").attr("placeholder", questionQueue[currentQuestion].value);

                  if (questionQueue[currentQuestion].key in inputJSON) mainInput[ix].val(inputJSON[questionQueue[currentQuestion].key]);

                } else if (ix == 2) {
                  mainInput[2].css("display", "block");
                  mainInput[0].css("display", "none");
                  mainInput[1].css("display", "none");
                  mainInput[ix].val("").attr("placeholder", questionQueue[currentQuestion].value);

                  if (questionQueue[currentQuestion].key in inputJSON) mainInput[ix].val(inputJSON[questionQueue[currentQuestion].key]);
                }

              } else {
                helper.text("Hit \"Finish\" to complete.");
                mainInput[ix].val("").hide();
                $("#mainFieldSubmit").hide();
                $("#submit").fadeIn();

                var backObject = questionQueue[currentQuestion] ? questionQueue[currentQuestion] : {"key": "finish"};
                backObject["queue"] = questionQueue.slice();
                backObject["currentIndex"] = currentQuestion;
                backObject["previousValue"] = q_prev;
                backStack.push(backObject);
              }



            }).fadeIn();



            var input = mainInput[ix].val();



            q_prev = input;

            // add data to inputJSON, the object that will eventually be sent up to the server
            inputJSON[questionQueue[currentQuestion].key] = input;

            // iteratively move through all of the questions
            if (mainInput[ix].val() == questionQueue[currentQuestion].followUpValue && questionQueue[currentQuestion].followUpValue !== "NONE") {
              var followUpArray = questionQueue[currentQuestion].followUpQuestions.slice();

              questionQueue.length = 0; // wipe array
              questionQueue = followUpArray.slice();

              currentQuestion = 0;

            } else {
              if (mainInput[1].val() !== null || mainInput[0].val() !== "") currentQuestion++;
            }


          }


          // How to go back in time (without having to go 88 mph)
          function back() {
            if (q_count > 0) {
              q_count--;
              console.log(q_count);
              if (q_count == 0) {
                $("#backButton").css("display", "none");
              }

              // the LAST object on the backstack is the current question
              current = backStack[backStack.length-1]; // grab last object
              backStack.pop(); // remove it
              prev = backStack[backStack.length-1]; // get the previous object
              ix = getInputIndex(prev.type);
              currentQuestion = prev.currentIndex;
              questionQueue = prev.queue.slice();

              helper.text(prev.helper);

              if (ix == 1) {
                mainInput[0].css("display", "none");
                mainInput[1].css("display", "inline-block");
                mainInput[2].css("display", "none");
                $("#mainOption").html("<option value=\"\" id=\"optionHelper\" disabled selected>Option Placeholder</option>");
                $("#optionHelper").text(prev.value);
                for (var i = 0; i < prev.options.length; i++) {
                  mainInput[ix].append('<option value="'+prev.options[i]+'">'+prev.options[i]+'</option>');
                }
                $("#mainOption").val(current.previousValue);
                $("#mainFieldSubmit").show();
                $("#submit").hide();

              } else if (ix == 0) {
                mainInput[0].css("display", "inline-block");
                mainInput[1].css("display", "none");
                mainInput[2].css("display", "none");
                mainInput[ix].val(current.previousValue).attr("placeholder", prev.value);
                $("#mainFieldSubmit").show();
                $("#submit").hide();

              } else if (ix == 2) {
                mainInput[2].css("display", "block");
                mainInput[0].css("display", "none");
                mainInput[1].css("display", "none");
                mainInput[ix].val(current.previousValue).attr("placeholder", prev.value);
                $("#mainFieldSubmit").show();
                $("#submit").hide();
              }

            }

          }





          // load initial question
          next();




          // Standard handlers for when the user hits return or "OK"
          $('.contact input').keyup(function(e){
              if (e.keyCode == 13 && validateQuestion(questionQueue[currentQuestion], mainInput[ix].val())) {
                next();
              } else {
                console.log("Invalid.");
              }
          });

          $("#mainFieldSubmit").click(function() {
              if (validateQuestion(questionQueue[currentQuestion], mainInput[ix].val())) {
                next();
              } else {
                console.log("Invalid.");
              }
          });

          // Back button handler
          $(".contact #backButton").click(function() {
              back();
          });




          // SUBMIT button is clicked: Sends form data off to the server.
          $('#submit').click(function() {
            console.log(inputJSON);

            // make the call
            $.ajax({
              type: "POST",
              url: "http://"+HOSTNAME+":"+PORT+"/api/addUserRequest",
              data: inputJSON,
              error: function(err) { // Something went wrong
                console.log(err);
                helper.html("There was an error submitting. Try again later.");
              },
              success: function() { // if everything's all good, then fade everything out and redirect to the beginning of the form
                helper.text("Successfully submitted.");
                setTimeout(function() {
                    $("body").fadeOut(function() {
                      location.href = "/";
                    });
                }, 1000);
              },
              dataType: 'html',
            });

            return false;
          });

    });
