import express from "express";
import Project from "../models/projectModel.js";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";

const projectsRouter = express.Router();

// Get project users
projectsRouter.get("/:projectId/users", async (req, res) => {
  const auth = req.currentUser;
  if (auth) {
    const projectId = req.params.projectId;
    Project.findOne({ _id: projectId })
      .populate("users", "displayName email _id uid")
      .exec((err, project) => {
        return res.status(200).json(project.users);
      });
  } else {
    return res.status(401).send("Not authorized");
  }
});

// Gets project event info and merged user event info for all project users
projectsRouter.get("/:projectId/events", async (req, res) => {
  const auth = req.currentUser;
  if (auth) {
    const projectId = req.params.projectId;
    const currDate = new Date();
    Project.findOne({ _id: projectId }, (err, project) => {
      Project.findOne({ _id: projectId }, "users events")
        .populate({
          path: "users",
          model: "User",
          select: "events -_id",
          populate: {
            path: "events",
            model: "Event",
            select: "start end -_id",
            match: {
              $and: [
                { end: { $lt: project.endDate } },
                { end: { $gt: currDate } },
                { project: { $ne: projectId } },
              ],
            },
            options: { sort: { start: 1 } },
          },
        })
        .populate("events", "title start end _id")
        .exec((err, project) => {
          const arrayOfUserEventArrays = project.users.map((user) => {
            return user.events;
          });
          const sortedUserEvents = mergeSortedArrays(arrayOfUserEventArrays);
          const mergedUserEvents = mergeOverlappingEvents(sortedUserEvents);
          const payload = new Object();
          payload.mergedEvents = mergedUserEvents;
          payload.projectEvents = project.events;
          return res.status(200).send(payload);
        });
    });
  } else {
    return res.status(401).send("Not authorized");
  }
});

// Change project info
projectsRouter.put("/:projectId", (req, res) => {
  const auth = req.currentUser;
  if (auth) {
    const projectId = req.params.projectId;
    Project.findOneAndUpdate({ _id: projectId }, req.body, (err, project) => {
      return res.status(200).send("Project info changed");
    });
  } else {
    return res.status(401).send("Not authorized");
  }
});

// Add a user to a project
projectsRouter.put("/:projectId/users", (req, res) => {
  const auth = req.currentUser;
  if (auth) {
    const projectId = req.params.projectId;
    const email = req.body.email;
    Project.findOne({ _id: projectId }, (err, project) => {
      User.findOne({ email: email }, (err, user) => {
        if (!user) {
          return res.status(404).send("User does not exist"); // Validation for user input
        } else {
          project.users.push(user);
          project.save();
          user.projects.push(project);
          project.events.forEach((eventId) => user.events.push(eventId));
          user.save();
          return res.status(200).send("User added to project");
        }
      });
    });
  } else {
    return res.status(401).send("Not authorized");
  }
});

// Remove a user from a project
projectsRouter.delete("/:projectId/users/:userId", (req, res) => {
  const auth = req.currentUser;
  if (auth) {
    const projectId = req.params.projectId;
    const userId = req.params.userId; // _id field of user, NOT uid
    Project.findOneAndUpdate(
      { _id: projectId },
      { $pull: { users: userId } },
      (err, project) => {
        User.findOneAndUpdate(
          { _id: userId },
          { $pull: { events: { $in: project.events }, projects: projectId } },
          (err, user) => {
            return res.status(200).send("User removed from project");
          }
        );
      }
    );
  } else {
    return res.status(401).send("Not authorized");
  }
});

// Creates an event with request body (title, start, end) and adds it to the project's event array
projectsRouter.post("/:projectId/events", (req, res) => {
  const auth = req.currentUser;
  if (auth) {
    const uid = auth.uid;
    const projectId = req.params.projectId;
    req.body.project = projectId; // Add project field to body
    const event = new Event(req.body);
    Project.findOne({ _id: projectId }, (err, project) => {
      event.save();
      project.events.push(event);
      project.save();
      project.users.forEach((userId) => {
        User.findOne({ _id: userId }, (err, user) => {
          user.events.push(event);
          user.save();
        });
      });
      return res.status(201).send("Event created");
    });
  } else {
    return res.status(401).send("Not authorized");
  }
});

// Change event info
projectsRouter.put("/:projectId/events/:eventId", (req, res) => {
  const auth = req.currentUser;
  if (auth) {
    const uid = auth.uid;
    const projectId = req.params.projectId;
    const eventId = req.params.eventId;
    Project.findOne({ _id: projectId }, (err, project) => {
      Event.findOneAndUpdate({ _id: eventId }, req.body, (err, event) => {
        return res.status(200).send("Event modified");
      });
    });
  } else {
    return res.status(401).send("Not authorized");
  }
});

// Delete event
projectsRouter.delete("/:projectId/events/:eventId", (req, res) => {
  const auth = req.currentUser;
  if (auth) {
    const uid = auth.uid;
    const projectId = req.params.projectId;
    const eventId = req.params.eventId;
    Project.findOneAndUpdate(
      { _id: projectId },
      { $pull: { events: eventId } },
      (err, project) => {
        project.users.forEach((userId) =>
          User.findOneAndUpdate(
            { _id: userId },
            { $pull: { events: eventId } },
            (err, user) => {}
          )
        );
        Event.findOneAndDelete({ _id: eventId }, (err, event) => {
          return res.status(200).send("Event deleted");
        });
      }
    );
  } else {
    return res.status(401).send("Not authorized");
  }
});

// Delete project
projectsRouter.delete("/:projectId", (req, res) => {
  const auth = req.currentUser;
  if (auth) {
    const uid = auth.uid;
    const projectId = req.params.projectId;
    Project.findOneAndDelete({ _id: projectId }, (err, project) => {
      Event.deleteMany({ _id: { $in: project.events } }, (err, event) => {});
      project.users.forEach((userId) =>
        User.findOneAndUpdate(
          { _id: userId },
          { $pull: { events: { $in: project.events }, projects: projectId } },
          (err, user) => {}
        )
      );
      return res.status(200).send("Project deleted");
    });
  } else {
    return res.status(401).send("Not authorized");
  }
});

/**
 * Helper functions
 */
// Helper function for event merging: given an array of sorted user event arrays, merges arrays into single sorted array
function mergeSortedArrays(arrayOfArrays) {
  //
  const arrayCount = arrayOfArrays.length;

  if (arrayCount == 0) {
    return []; // No events, just return empty array
  }

  if (arrayCount == 1) {
    return arrayOfArrays[0]; // No merge required
  }

  const newArrayOfArrays = [];
  for (let i = 0; i < Math.floor(arrayCount / 2); i++) {
    newArrayOfArrays[i] = mergeTwoSortedEventArrays(
      arrayOfArrays[2 * i],
      arrayOfArrays[2 * i + 1]
    );
  }

  if (arrayCount % 2 == 1) {
    // Odd number of arrays
    newArrayOfArrays[Math.floor(arrayCount / 2)] =
      arrayOfArrays[arrayCount - 1];
  }
  return mergeSortedArrays(newArrayOfArrays);
}

// Helper function for array merging: merges two sorted event arrays
function mergeTwoSortedEventArrays(A1, A2) {
  const result = [];
  let A1i = 0;
  let A2i = 0;
  let resultIndex = 0;

  while (A1i < A1.length && A2i < A2.length) {
    if (A1[A1i].start <= A2[A2i].start) {
      result[resultIndex] = A1[A1i];
      A1i++;
    } else {
      result[resultIndex] = A2[A2i];
      A2i++;
    }
    resultIndex++;
  }

  while (A1i < A1.length) {
    // All elements from A2 used
    result[resultIndex] = A1[A1i];
    resultIndex++;
    A1i++;
  }

  while (A2i < A2.length) {
    // All elements from A1 used
    result[resultIndex] = A2[A2i];
    resultIndex++;
    A2i++;
  }

  return result;
}

// Helper function for merging overlapping events
function mergeOverlappingEvents(sortedEventArray) {
  const result = [];

  if (sortedEventArray.length <= 1) {
    // No merge required
    return sortedEventArray;
  }

  let low = sortedEventArray[0].start;
  let high = sortedEventArray[0].end;
  let resultIndex = 0;
  for (let i = 1; i < sortedEventArray.length; i++) {
    const currEvent = sortedEventArray[i];
    if (currEvent.start <= high) {
      if (currEvent.end > high) {
        high = currEvent.end;
      }
    } else {
      // Gap between current high and next event
      const newEvent = new Object();
      newEvent.start = low;
      newEvent.end = high;

      result[resultIndex] = newEvent;
      resultIndex++;

      low = currEvent.start;
      high = currEvent.end;
    }
  }
  const lastEvent = new Object();
  lastEvent.start = low;
  lastEvent.end = high;
  result[resultIndex] = lastEvent;
  return result;
}

export default projectsRouter;
