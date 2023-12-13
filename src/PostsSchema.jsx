export default function PostsSchema() {
    return({
    "$schema": "http://json-schema.org/draft-07/schema",
    "title": "Posts",
    "type": "object",
    "$defs": {
        "post": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "content":{
                    "type": "string",
                    "maxLength": 250,
                    "description": "The content of the post."
                },
                "createdAt":{
                    "type": "string",
                    "format": "date",
                    "maxLength": 10,
                    "description": "The date of this post."
                }
            },
            "required": [
                "content",
                "createdAt"
            ]
        }
    },
    "properties": {
        "posts": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/post"
          }
        }
    },
    "additionalProperties": false,
    "required": [
        "posts"
    ]
    })

}