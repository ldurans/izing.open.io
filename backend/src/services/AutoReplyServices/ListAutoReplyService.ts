import { Includeable } from "sequelize";
import AutoReply from "../../models/AutoReply";
import StepsReply from "../../models/StepsReply";
import StepsReplyAction from "../../models/StepsReplyAction";

interface Response {
  autoReply: AutoReply[];
}
const ListAutoReplyService = async (): Promise<Response> => {
  let includeCondition: Includeable[];
  // eslint-disable-next-line prefer-const
  includeCondition = [
    {
      model: StepsReply,
      include: [
        {
          model: StepsReplyAction,
          as: "stepsReplyAction",
          attributes: [
            "id",
            "stepReplyId",
            "words",
            "action",
            "queueId",
            "userIdDestination",
            "nextStepId",
            "replyDefinition"
          ]
        }
      ],
      as: "stepsReply",
      attributes: ["id", "reply", "idAutoReply", "userId", "initialStep"]
    }
  ];
  const autoReply = await AutoReply.findAll({
    include: includeCondition,
    order: [[{ model: StepsReply, as: "stepsReply" }, "id", "ASC"]]
  });

  return { autoReply };
};

export default ListAutoReplyService;
