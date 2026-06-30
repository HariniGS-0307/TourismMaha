import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const baseUrl = 'http://localhost:3000';

function createJar() {
  const cookies = new Map();
  return {
    apply(headers) {
      if (cookies.size) {
        headers.set('cookie', Array.from(cookies.entries()).map(([k, v]) => `${k}=${v}`).join('; '));
      }
    },
    capture(response) {
      const setCookies = response.headers.getSetCookie?.() ?? [];
      for (const cookie of setCookies) {
        const first = cookie.split(';')[0];
        const i = first.indexOf('=');
        if (i > 0) cookies.set(first.slice(0, i), first.slice(i + 1));
      }
    },
  };
}

async function request(path, options = {}, jar) {
  const headers = new Headers(options.headers ?? {});
  jar?.apply(headers);
  const response = await fetch(baseUrl + path, { ...options, headers, redirect: 'manual' });
  jar?.capture(response);
  return response;
}

async function login(email, password) {
  const jar = createJar();
  const csrfResponse = await request('/api/auth/csrf', undefined, jar);
  const csrfData = await csrfResponse.json();
  const body = new URLSearchParams({
    csrfToken: csrfData.csrfToken,
    email,
    password,
    callbackUrl: baseUrl + '/dashboard',
    json: 'true',
  });
  await request('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  }, jar);
  return jar;
}

const contactResponse = await request('/api/contact', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    name: 'Harini',
    email: 'harini@example.com',
    topic: 'general-enquiry',
    message: 'Hello support team, I am testing the contact form flow for the Maharashtra Adventures website.',
  }),
});
const contactData = await contactResponse.json();
console.log('CONTACT_STATUS ' + contactResponse.status);
console.log('CONTACT_MESSAGE ' + (contactData.message ?? contactData.error));

const operatorJar = await login('operator1@maharashtra-adventures.test', 'Password@123');
const operatorPage = await request('/dashboard/operator/bookings', undefined, operatorJar);
const operatorHtml = await operatorPage.text();
console.log('OPERATOR_PAGE_STATUS ' + operatorPage.status);
console.log('OPERATOR_REPLIES_VISIBLE ' + (operatorHtml.includes('Reviews and replies') ? 'YES' : 'NO'));

const review = await prisma.review.findFirst({
  where: {
    listing: {
      operator: {
        user: {
          email: 'operator1@maharashtra-adventures.test',
        },
      },
    },
  },
  orderBy: { createdAt: 'desc' },
  select: { id: true, reply: true },
});

if (review) {
  const replyResponse = await request('/api/reviews', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      reviewId: review.id,
      reply: review.reply ?? 'Thanks for the feedback — we are glad you enjoyed the experience.',
    }),
  }, operatorJar);
  const replyData = await replyResponse.json();
  console.log('REPLY_STATUS ' + replyResponse.status);
  console.log('REPLY_HAS_ID ' + (replyData?.id ? 'YES' : 'NO'));
}

await prisma.$disconnect();
