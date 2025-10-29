// graphql/schema.js
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInt
} = require('graphql');

const Task = require('../Models/Task');

// Comment type
const CommentType = new GraphQLObjectType({
  name: 'Comment',
  fields: () => ({
    user: { type: GraphQLString },
    text: { type: GraphQLString },
    date: { type: GraphQLString }
  })
});

// History type
const HistoryType = new GraphQLObjectType({
  name: 'History',
  fields: () => ({
    field: { type: GraphQLString },
    oldValue: { type: GraphQLString },
    newValue: { type: GraphQLString },
    updatedBy: { type: GraphQLString },
    updatedAt: { type: GraphQLString }
  })
});

// Task GraphQL Type
const TaskType = new GraphQLObjectType({
  name: 'Task',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    dueDate: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },

    // extended fields
    priority: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLString) },
    category: { type: GraphQLString },
    estimatedHours: { type: GraphQLFloat },
    actualHours: { type: GraphQLFloat },
    progress: { type: GraphQLInt },
    attachments: { type: new GraphQLList(GraphQLString) },
    createdBy: { type: GraphQLString },
    assignedTo: { type: GraphQLString },
    reviewer: { type: GraphQLString },
    team: { type: new GraphQLList(GraphQLString) },
    completedAt: { type: GraphQLString },
    isRecurring: { type: GraphQLBoolean },
    recurrencePattern: { type: GraphQLString },
    dependencies: { type: new GraphQLList(GraphQLID) },
    subTasks: { type: new GraphQLList(GraphQLID) },
    comments: { type: new GraphQLList(CommentType) },
    historyLog: { type: new GraphQLList(HistoryType) }
  })
});

// Task input for creation and updates
const TaskInput = new GraphQLInputObjectType({
  name: 'TaskInput',
  fields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    dueDate: { type: GraphQLString },

    // extended fields
    priority: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLString) },
    category: { type: GraphQLString },
    estimatedHours: { type: GraphQLFloat },
    actualHours: { type: GraphQLFloat },
    progress: { type: GraphQLInt },
    attachments: { type: new GraphQLList(GraphQLString) },
    createdBy: { type: GraphQLString },
    assignedTo: { type: GraphQLString },
    reviewer: { type: GraphQLString },
    team: { type: new GraphQLList(GraphQLString) },
    completedAt: { type: GraphQLString },
    isRecurring: { type: GraphQLBoolean },
    recurrencePattern: { type: GraphQLString },
    dependencies: { type: new GraphQLList(GraphQLID) },
    subTasks: { type: new GraphQLList(GraphQLID) },
    comments: { type: new GraphQLList(new GraphQLInputObjectType({
      name: 'CommentInput',
      fields: {
        user: { type: GraphQLString },
        text: { type: GraphQLString },
        date: { type: GraphQLString }
      }
    })) },

    // optional field to indicate who made the update for history log
    updatedBy: { type: GraphQLString }
  }
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    task: {
      type: TaskType,
      args: { id: { type: GraphQLID } },
      resolve: async (_, { id }) => {
        return await Task.findById(id).lean();
      }
    },
    tasks: {
      type: new GraphQLList(TaskType),
      args: {
        status: { type: GraphQLString },
        search: { type: GraphQLString }
      },
      resolve: async (_, { status, search }) => {
        const filter = {};
        if (status) filter.status = status;
        if (search) {
          filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }
        return await Task.find(filter).sort({ createdAt: -1 }).lean();
      }
    }
  }
});

// helper to create history entries
function createHistoryEntries(oldDoc, newFields, updatedBy) {
  const entries = [];
  for (const key of Object.keys(newFields)) {
    const oldValue = oldDoc ? oldDoc[key] : undefined;
    const newValue = newFields[key];
    // convert objects/arrays to JSON string for readable history
    const oldStr = (oldValue === undefined) ? '' : (typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue));
    const newStr = (newValue === undefined) ? '' : (typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue));
    if (oldStr !== newStr) {
      entries.push({
        field: key,
        oldValue: oldStr,
        newValue: newStr,
        updatedBy: updatedBy || ''
      });
    }
  }
  return entries;
}

// Mutations
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createTask: {
      type: TaskType,
      args: {
        input: { type: new GraphQLNonNull(TaskInput) }
      },
      resolve: async (_, { input }) => {
        const taskData = {
          title: input.title,
          description: input.description || '',
          status: input.status || 'TODO',
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,

          // extended
          priority: input.priority || 'MEDIUM',
          tags: input.tags || [],
          category: input.category || '',
          estimatedHours: input.estimatedHours || 0,
          actualHours: input.actualHours || 0,
          progress: input.progress || 0,
          attachments: input.attachments || [],
          createdBy: input.createdBy || '',
          assignedTo: input.assignedTo || '',
          reviewer: input.reviewer || '',
          team: input.team || [],
          completedAt: input.completedAt ? new Date(input.completedAt) : undefined,
          isRecurring: input.isRecurring || false,
          recurrencePattern: input.recurrencePattern || '',
          dependencies: input.dependencies || [],
          subTasks: input.subTasks || [],
          comments: input.comments || []
        };

        const task = new Task(taskData);
        const saved = await task.save();
        return saved.toObject();
      }
    },

    updateTask: {
      type: TaskType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        input: { type: new GraphQLNonNull(TaskInput) }
      },
      resolve: async (_, { id, input }) => {
        const existing = await Task.findById(id).lean();
        if (!existing) throw new Error('Task not found');

        const updateFields = {
          title: input.title,
          description: input.description || '',
          status: input.status || 'TODO',
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,

          // extended
          priority: input.priority || existing.priority,
          tags: input.tags || existing.tags,
          category: input.category || existing.category,
          estimatedHours: input.estimatedHours || existing.estimatedHours,
          actualHours: input.actualHours || existing.actualHours,
          progress: input.progress || existing.progress,
          attachments: input.attachments || existing.attachments,
          createdBy: input.createdBy || existing.createdBy,
          assignedTo: input.assignedTo || existing.assignedTo,
          reviewer: input.reviewer || existing.reviewer,
          team: input.team || existing.team,
          completedAt: input.completedAt ? new Date(input.completedAt) : (input.status === 'DONE' ? new Date() : existing.completedAt),
          isRecurring: typeof input.isRecurring === 'boolean' ? input.isRecurring : existing.isRecurring,
          recurrencePattern: input.recurrencePattern || existing.recurrencePattern,
          dependencies: input.dependencies || existing.dependencies,
          subTasks: input.subTasks || existing.subTasks,
          // If comments provided, replace; otherwise keep existing
          comments: input.comments || existing.comments
        };

        // create history entries
        const historyEntries = createHistoryEntries(existing, updateFields, input.updatedBy);

        // append history entries into update operator
        const updated = await Task.findByIdAndUpdate(
          id,
          {
            $set: updateFields,
            $push: { historyLog: { $each: historyEntries } }
          },
          { new: true, runValidators: true }
        );

        return updated;
      }
    },

    patchTaskStatus: {
      type: TaskType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        status: { type: new GraphQLNonNull(GraphQLString) },
        updatedBy: { type: GraphQLString }
      },
      resolve: async (_, { id, status, updatedBy }) => {
        const valid = ['TODO', 'IN_PROGRESS', 'DONE'];
        if (!valid.includes(status)) throw new Error('Invalid status');

        const existing = await Task.findById(id).lean();
        if (!existing) throw new Error('Task not found');

        const update = { status };
        if (status === 'DONE') update.completedAt = new Date();
        else if (existing.completedAt && status !== 'DONE') update.completedAt = undefined;

        const historyEntry = createHistoryEntries(existing, update, updatedBy);

        const updated = await Task.findByIdAndUpdate(
          id,
          {
            $set: update,
            $push: { historyLog: { $each: historyEntry } }
          },
          { new: true }
        );
        return updated;
      }
    },

    deleteTask: {
      type: GraphQLBoolean,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_, { id }) => {
        const res = await Task.findByIdAndDelete(id);
        return !!res;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
