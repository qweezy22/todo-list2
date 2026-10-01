const API_URL = "";

function withAuthorization(options = {}) {
  const token = localStorage.getItem("token");

  return {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

async function request(path, options = {}, errorMessage) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new Error("Не удалось подключиться к серверу");
  }

  const responseText = await response.text();
  let data = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    const serverMessage =
      typeof data === "string" ? data : data?.message;

    throw new Error(serverMessage || errorMessage);
  }

  return data;
}

export async function login(email, password) {
  return request(
    "/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    },
    "Не удалось войти",
  );
}

export async function register(email, password) {
  return request(
    "/api/auth/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    },
    "Не удалось зарегистрироваться",
  );
}

export async function getTasks() {
  return request(
    "/api/tasks",
    withAuthorization(),
    "Не удалось загрузить задачи",
  );
}

export async function createTask(title, description) {
  return request(
    "/api/tasks",
    withAuthorization({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description, completed: false }),
    }),
    "Не удалось создать задачу",
  );
}

export async function updateTask(id, title, description, completed) {
  return request(
    `/api/tasks/${id}`,
    withAuthorization({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description, completed }),
    }),
    "Не удалось изменить задачу",
  );
}

export async function deleteTask(id) {
  return request(
    `/api/tasks/${id}`,
    withAuthorization({ method: "DELETE" }),
    "Не удалось удалить задачу",
  );
}
