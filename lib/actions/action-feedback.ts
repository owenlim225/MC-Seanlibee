export type ActionFeedback = {
  ok: boolean;
  message?: string;
  code?: string;
};

export function actionSuccess(message: string, code?: string): ActionFeedback {
  return { ok: true, message, code };
}

export function actionNoop(code: string, message?: string): ActionFeedback {
  return { ok: false, code, message };
}
