
var likert_scale_complexity = [
    "1 - low complexity", 
    "2", 
    "3", 
    "4 - medium complexity", 
    "5", 
    "6", 
    "7 - high complexity"
  ];

var likert_scale_function = [
    "1 - very unlikely to have a function", 
    "2", 
    "3", 
    "4 - equally likely to have a function or not", 
    "5", 
    "6", 
    "7 - very likely to have a function"
  ];

function generate_likert_scales(question_type) {
    var timeline_base_obj = {
        timeline: [
            {
              questions: [
                {
                  required: true,
                },
              ],
              scale_width: 600,
              data: {
              }
            }
          ],
    }

    switch(question_type) {
        case "complexity": 
            timeline_base_obj.timeline[0].questions[0].prompt = 
                "On a scale of 1 to 7, what is the complexity of the shape and outline of this three-dimensional item?";
            timeline_base_obj.timeline[0].questions[0].labels = likert_scale_complexity;
            timeline_base_obj.timeline[0].questions[0].name = "complexity";
            timeline_base_obj.timeline[0].data.phase = "complexity";
            break; 
        case "function": 
            timeline_base_obj.timeline[0].questions[0].prompt = 
                "On a scale of 1 to 7, how likely is it the item could have a function or be used for a certain purpose?";
            timeline_base_obj.timeline[0].questions[0].labels = likert_scale_function;
            timeline_base_obj.timeline[0].questions[0].name = "function";
            timeline_base_obj.timeline[0].data.phase = "function";
            break; 

        default: 
            console.log("nothing happens");
    }

    return timeline_base_obj;
  }