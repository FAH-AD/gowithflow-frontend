import axios from 'axios';
import multer from 'multer';
import FormData from 'form-data';

const EVENTBRITE_API_BASE = 'https://www.eventbriteapi.com/v3';
const EVENTBRITE_ACCESS_TOKEN = process.env.EVENTBRITE_ACCESS_TOKEN;
const EVENTBRITE_ORG_ID = process.env.EVENTBRITE_ORG_ID;

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false);
    }
  }
});

// Helper to create Eventbrite API client
const eventbriteClient = () => {
  return axios.create({
    baseURL: EVENTBRITE_API_BASE,
    headers: {
      'Authorization': `Bearer ${EVENTBRITE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Step 1: Upload image to Eventbrite
 * POST /admin/eventbrite/upload-image
 * 
 * Eventbrite image upload flow:
 * 1. GET /media/upload/ to get upload instructions
 * 2. Upload image to the returned upload URL
 * 3. POST notify endpoint with upload_token
 */
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }
    console.log('the file is', req.file);

    // Step 1: Get upload instructions from Eventbrite
    // GET /media/upload/?type=image-event-logo&token=OAUTH_TOKEN
    const client = eventbriteClient();
    const uploadInstructionsResponse = await client.get('/media/upload/?type=image-event-logo');
    console.log('the upload instructions response is', uploadInstructionsResponse.data);
    const {
      upload_url,
      upload_data,
      file_parameter_name,
      upload_token,
    } = uploadInstructionsResponse.data;

    // Step 2: Upload image to Eventbrite's upload URL
    // POST to upload_url with upload_data as form fields and file using file_parameter_name
    const formData = new FormData();
    console.log(upload_data);

    // Add all upload_data fields to form
    if (upload_data && typeof upload_data === 'object') {
      Object.keys(upload_data).forEach((key) => {
        formData.append(key, upload_data[key]);
      });
    }

    // Add file using the file_parameter_name from Eventbrite response
    formData.append(file_parameter_name, req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Upload to Eventbrite's upload URL (this is typically an S3 or similar URL)
    await axios.post(upload_url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Step 3: Notify Eventbrite that upload is complete
    // POST /media/upload/ with upload_token to get the final media ID
    const notifyResponse = await client.post('/media/upload/', {
      upload_token: upload_token,
      type: 'image-event-logo',
    });

    const logo_id = notifyResponse.data.id;

    res.status(200).json({
      success: true,
      data: {
        logo_id,
        url: notifyResponse.data.url,
      },
    });
  } catch (error) {
    console.error('Eventbrite image upload error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image to Eventbrite',
      error: error.response?.data || error.message,
    });
  }
};

// Middleware for image upload
export const uploadImageMiddleware = upload.single('image');

/**
 * NEW (Step 1): Get Eventbrite media upload instructions
 * POST /admin/eventbrite/media/upload-instructions
 *
 * Mirrors the Eventbrite docs step:
 * GET https://www.eventbriteapi.com/v3/media/upload/?type=image-event-logo
 *
 * Returns upload_url, upload_data, file_parameter_name, upload_token
 */
export const getUploadInstructions = async (req, res) => {
  try {
    const { type } = req.query; // allow dynamic type
    const client = eventbriteClient();
    client.interceptors.request.use((config) => {
      console.log('FINAL REQUEST:', {
        method: config.method,
        url: config.baseURL + config.url,
        params: config.params,
      });
      return config;
    });

    const uploadInstructionsResponse = await client.get(
      '/media/upload/?type=image-event-logo'
    );

    const {
      upload_url,
      upload_data,
      file_parameter_name,
      upload_token,
    } = uploadInstructionsResponse.data;

    res.status(200).json({
      success: true,
      data: {
        upload_url,
        upload_data,
        file_parameter_name,
        upload_token,
      },
    });
  } catch (error) {
    console.error(
      'Eventbrite upload instructions error:',
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: 'Failed to get upload instructions from Eventbrite',
      error: error.response?.data || error.message,
    });
  }
};


/**
 * NEW (Step 2): Upload file to the returned upload_url
 * POST /admin/eventbrite/media/upload-file
 *
 * Body: multipart/form-data
 * - upload_url: string
 * - file_parameter_name: string (from step 1)
 * - upload_data: JSON string (from step 1)
 * - file: file (image)
 */
export const uploadFileToEventbriteStorageMiddleware = upload.single('file');





export const uploadFileToEventbriteStorage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    const { upload_url, file_parameter_name, upload_data } = req.body;

    const parsedUploadData =
      typeof upload_data === 'string'
        ? JSON.parse(upload_data)
        : upload_data;

    const formData = new FormData();

    // ✅ EXACT ORDER REQUIRED BY S3

    // REQUIRED ORDER
    formData.append('key', parsedUploadData.key);
    formData.append('AWSAccessKeyId', parsedUploadData.AWSAccessKeyId);
    formData.append('acl', parsedUploadData.acl);
    formData.append('policy', parsedUploadData.policy);
    formData.append('signature', parsedUploadData.signature);
    
    // FILE — MUST INCLUDE filename + contentType
    formData.append(
      file_parameter_name,
      req.file.buffer,
      {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      }
    );
    
    const response = await axios.post(upload_url, formData, {
      headers: formData.getHeaders(), // 🚫 DO NOT override
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true,
    });
    

    if (![201, 204].includes(response.status)) {
      throw new Error(`S3 upload failed with status ${response.status}`);
    }

    return res.status(200).json({
      success: true,
      data: {
        uploaded: true,
        status: response.status,
      },
    });
  } catch (error) {
    console.error('S3 upload error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to upload file to Eventbrite storage',
      error: error.message,
    });
  }
};



/**
 * NEW (Step 3): Notify Eventbrite that upload is complete
 * POST /admin/eventbrite/media/notify-upload
 *
 * Body JSON:
 * - upload_token: string
 * - type: string (optional; defaults to image-event-logo)
 *
 * Returns logo_id + url
 */
export const notifyEventbriteUpload = async (req, res) => {
  try {
    const { upload_token, type = 'image-event-logo' } = req.body;
    if (!upload_token) {
      return res.status(400).json({ success: false, message: 'upload_token is required' });
    }

    const client = eventbriteClient();
    const notifyResponse = await client.post('/media/upload/', {
      upload_token,
      type,
    });

    res.status(200).json({
      success: true,
      data: {
        logo_id: notifyResponse.data.id,
        url: notifyResponse.data.url,
      },
    });
  } catch (error) {
    console.error('Eventbrite notify upload error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to notify Eventbrite about upload',
      error: error.response?.data || error.message,
    });
  }
};

/**
 * Step 2: Create Eventbrite Event (draft)
 * POST /admin/eventbrite/create-event
 * 
 * Creates a draft event in Eventbrite
 */
export const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      start_datetime,
      end_datetime,
      timezone,
      currency = 'USD',
      logo_id,
      online_event = false,
    } = req.body;

    // Validation
    if (!title || !description || !start_datetime || !end_datetime || !timezone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, start_datetime, end_datetime, timezone',
      });
    }

    // Build event payload according to Eventbrite API
    const eventPayload = {
      event: {
        name: {
          text: title,
          html: title,
        },
        description: {
          text: description,
          html: description.replace(/\n/g, '<br>'),
        },
        start: {
          timezone: timezone,
          utc: new Date(start_datetime).toISOString(),
        },
        end: {
          timezone: timezone,
          utc: new Date(end_datetime).toISOString(),
        },
        currency: currency,
        online_event: online_event === true || online_event === 'true',
        listed: false, // Draft mode - not listed yet
        shareable: false,
        invite_only: false,
        show_remaining: true,
        capacity: 0, // Unlimited capacity by default
      },
    };

    // Add logo if provided
    if (logo_id) {
      eventPayload.event.logo_id = logo_id;
    }

    // Create event via Eventbrite API
    const client = eventbriteClient();
    const response = await client.post(
      `/organizations/${EVENTBRITE_ORG_ID}/events/`,
      eventPayload
    );

    const eventData = response.data;

    res.status(201).json({
      success: true,
      data: {
        event_id: eventData.id,
        event_url: eventData.url,
        status: eventData.status,
        name: eventData.name?.text,
      },
    });
  } catch (error) {
    console.error('Eventbrite create event error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create event in Eventbrite',
      error: error.response?.data || error.message,
    });
  }
};

/**
 * Step 3: Create Ticket Class for Event
 * POST /admin/eventbrite/create-ticket
 * 
 * Creates a ticket class (free or paid) for an event
 */
export const createTicket = async (req, res, next) => {
  try {
    const {
      event_id,
      ticket_name = 'General Admission',
      free = true,
      price = 0,
      quantity = null, // null = unlimited
    } = req.body;

    if (!event_id) {
      return res.status(400).json({
        success: false,
        message: 'event_id is required',
      });
    }

    // Build ticket class payload
    const ticketPayload = {
      ticket_class: {
        name: ticket_name,
        free: free === true || free === 'true',
        quantity_total: quantity && quantity > 0 ? quantity : null,
        donation: false,
        hidden: false,
      },
    };

    // Add cost if paid ticket
    if (!ticketPayload.ticket_class.free && price > 0) {
      ticketPayload.ticket_class.cost = {
        currency: 'USD',
        value: Math.round(price * 100), // Eventbrite expects price in cents
        display: `$${price.toFixed(2)}`,
      };
    }

    // Create ticket class via Eventbrite API
    const client = eventbriteClient();
    const response = await client.post(
      `/events/${event_id}/ticket_classes/`,
      ticketPayload
    );

    const ticketData = response.data;

    res.status(201).json({
      success: true,
      data: {
        ticket_id: ticketData.id,
        ticket_name: ticketData.name,
        free: ticketData.free,
        cost: ticketData.cost,
        quantity_total: ticketData.quantity_total,
      },
    });
  } catch (error) {
    console.error('Eventbrite create ticket error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket in Eventbrite',
      error: error.response?.data || error.message,
    });
  }
};

/**
 * Step 4: Publish Event
 * POST /admin/eventbrite/publish-event
 * 
 * Publishes a draft event to make it live and searchable
 */
export const publishEvent = async (req, res, next) => {
  try {
    const { event_id } = req.body;

    if (!event_id) {
      return res.status(400).json({
        success: false,
        message: 'event_id is required',
      });
    }

    // Update event to published status
    const client = eventbriteClient();
    const response = await client.post(
      `/events/${event_id}/publish/`,
      {}
    );

    const eventData = response.data;

    res.status(200).json({
      success: true,
      data: {
        event_id: eventData.id,
        event_url: eventData.url,
        status: eventData.status,
        name: eventData.name?.text,
        published: eventData.status === 'live',
      },
    });
  } catch (error) {
    console.error('Eventbrite publish event error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to publish event in Eventbrite',
      error: error.response?.data || error.message,
    });
  }
};
