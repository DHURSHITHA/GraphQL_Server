npm init -y
npm install cors dotenv express express-graphql graphql mongoose
create task
mutation {
  createTask(input: {
    title: "New GraphQL Task",
    description: "Testing all 20 fields",
    status: "IN_PROGRESS",
    priority: "HIGH",
    tags: ["urgent","project"],
    category: "Feature",
    estimatedHours: 5.5,
    actualHours: 6.0,
    progress: 75,
    attachments: ["https://file.com/doc1.pdf"],
    createdBy: "John",
    assignedTo: "Alice",
    reviewer: "Manager",
    team: ["Backend Team"],
    dueDate: "2025-11-01T00:00:00Z",
    completedAt: "2025-11-02T00:00:00Z",
    isRecurring: true,
    recurrencePattern: "WEEKLY",
    dependencies: ["taskId1","taskId2"],
    subTasks: ["sub1","sub2"]
  }) {
    id title status priority progress createdBy assignedTo
  }
}




list all tasks 
query {
  tasks {
    id title status priority tags category progress createdBy
  }
}



get single task
query {
  task(id: "6901d74f4cdf32aea76bac74") {
    id title description status priority progress category
  }
}


update task
mutation {
  updateTask(id: "6901d74f4cdf32aea76bac74", input:{
    title:"Updated Task",
    description:"Updated desc",
    status:"DONE",
    priority:"CRITICAL",
    progress:100,
    actualHours:7.5,
    completedAt:"2025-11-05T00:00:00Z"
  }) {
    id title status priority progress updatedAt
  }
}




5️⃣ Patch Only Status
mutation {
  patchTaskStatus(id:"PUT_ID", status:"DONE") {
    id title status
  }
}

🧩 6️⃣ Delete Task
mutation {
  deleteTask(id:"PUT_ID")
}

🧩 7️⃣ Add Comments

If your schema supports nested comments:

mutation {
  updateTask(id:"PUT_ID", input:{
    title:"Add Comments",
    comments:[{ user:"Bob", text:"Good work", date:"2025-10-29T00:00:00Z" }]
  }) {
    id title description
  }
}

🧩 8️⃣ Add History Log
mutation {
  updateTask(id:"PUT_ID", input:{
    title:"Add History",
    historyLog:[{
      field:"status",
      oldValue:"TODO",
      newValue:"DONE",
      updatedBy:"Alice",
      updatedAt:"2025-10-29T00:00:00Z"
    }]
  }) {
    id title
  }
}



