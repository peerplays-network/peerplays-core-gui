ByteBuffer = require 'bytebuffer'
ObjectId = require './object_id'
Serializer = require './serializer'
Address = require '../ecc/address'
PublicKey = require '../ecc/key_public'

v = require './serializer_validation'
chain_types = require './chain_types'
config = require './serializer_config'
fp = require '../common/fast_parser'

module.exports = Types = {}

Types.uint8 =
    fromByteBuffer:(b)->
        b.readUint8()
    appendByteBuffer:(b, object)->
        v.require_range 0,0xFF,object, "uint8 #{object}"
        b.writeUint8 object
        return
    fromObject:(object)->
        v.require_range 0,0xFF,object, "uint8 #{object}"
        object
    toObject:(object, debug = {})->
        return 0 if debug.use_default and object is undefined
        v.require_range 0,0xFF,object, "uint8 #{object}"
        parseInt object

Types.uint16 =
    fromByteBuffer:(b)->
        b.readUint16()
    appendByteBuffer:(b, object)->
        v.require_range 0,0xFFFF,object, "uint16 #{object}"
        b.writeUint16 object
        return
    fromObject:(object)->
        v.require_range 0,0xFFFF,object, "uint16 #{object}"
        object
    toObject:(object, debug = {})->
        return 0 if debug.use_default and object is undefined
        v.require_range 0,0xFFFF,object, "uint16 #{object}"
        parseInt object

Types.uint32 =
    fromByteBuffer:(b)->
        b.readUint32()
    appendByteBuffer:(b, object)->
        v.require_range 0,0xFFFFFFFF,object, "uint32 #{object}"
        b.writeUint32 object
        return
    fromObject:(object)->
        v.require_range 0,0xFFFFFFFF,object, "uint32 #{object}"
        object
    toObject:(object, debug = {})->
        return 0 if debug.use_default and object is undefined
        v.require_range 0,0xFFFFFFFF,object, "uint32 #{object}"
        parseInt object

MIN_SIGNED_32 = -1 * Math.pow(2,31)
MAX_SIGNED_32 = Math.pow(2,31) - 1

Types.varint32 =
    fromByteBuffer:(b)->
        b.readVarint32()
    appendByteBuffer:(b, object)->
        v.require_range(
            MIN_SIGNED_32
            MAX_SIGNED_32
            object
            "uint32 #{object}"
        )
        b.writeVarint32 object
        return
    fromObject:(object)->
        v.require_range(
            MIN_SIGNED_32
            MAX_SIGNED_32
            object
            "uint32 #{object}"
        )
        object
    toObject:(object, debug = {})->
        return 0 if debug.use_default and object is undefined
        v.require_range(
            MIN_SIGNED_32
            MAX_SIGNED_32
            object
            "uint32 #{object}"
        )
        parseInt object

Types.int64 =
    fromByteBuffer:(b)->
        b.readInt64()
    appendByteBuffer:(b, object)->
        v.required object
        b.writeInt64 v.to_long object
        return
    fromObject:(object)->
        v.required object
        v.to_long object
    toObject:(object, debug = {})->
        return "0" if debug.use_default and object is undefined
        v.required object
        v.to_long(object).toString()

Types.uint64 =
    fromByteBuffer:(b)->
        b.readUint64()
    appendByteBuffer:(b, object)->
        b.writeUint64 v.to_long v.unsigned object
        return
    fromObject:(object)->
        v.to_long v.unsigned object
    toObject:(object, debug = {})->
        return "0" if debug.use_default and object is undefined
        v.to_long(object).toString()

Types.string =
    fromByteBuffer:(b)->
        len = b.readVarint32()
        b_copy = b.copy(b.offset, b.offset + len); b.skip len
        new Buffer(b_copy.toBinary(), 'binary')
    appendByteBuffer:(b, object)->
        v.required object
        b.writeVarint32(object.length)
        b.append(object.toString('binary'), 'binary')
        return
    fromObject:(object)->
        v.required object
        new Buffer object
    toObject:(object, debug = {})->
        return "" if debug.use_default and object is undefined
        object.toString()

Types.bytes = (size)->
    fromByteBuffer:(b)->
        if size is undefined
            len = b.readVarint32()
            b_copy = b.copy(b.offset, b.offset + len); b.skip len
            new Buffer(b_copy.toBinary(), 'binary')
        else
            b_copy = b.copy(b.offset, b.offset + size); b.skip size
            new Buffer(b_copy.toBinary(), 'binary')
    appendByteBuffer:(b, object)->
        v.required object
        if size is undefined
            b.writeVarint32(object.length)
        b.append(object.toString('binary'), 'binary')
        return
    fromObject:(object)->
        v.required object
        new Buffer object, 'hex'
    toObject:(object, debug = {})->
        if debug.use_default and object is undefined
            zeros=(num)-> new Array( num ).join( "00" )
            return zeros size
        v.required object
        object.toString 'hex'

Types.bool =
    fromByteBuffer:(b)->
        b.readUint8()
    appendByteBuffer:(b, object)->
        # supports boolean or integer
        b.writeUint8 if object then 1 else 0
        #b.writeUint8 object
        return
    fromObject:(object)->
        if object then 1 else 0
    toObject:(object, debug = {})->
        return no if debug.use_default and object is undefined
        if object then yes else no

Types.void =
    fromByteBuffer:(b)->
        throw new Error "(void) undefined type"
    appendByteBuffer:(b, object)->
        throw new Error "(void) undefined type"
    fromObject:(object)->
        throw new Error "(void) undefined type"
    toObject:(object, debug = {})->
        if debug.use_default and object is undefined
            return undefined
        throw new Error "(void) undefined type"

Types.array = (st_operation)->
    fromByteBuffer:(b)->
        size = b.readVarint32()
        if config.hex_dump
            console.log "varint32 size = " + size.toString(16)
        for i in [0...size] by 1
            st_operation.fromByteBuffer b
    appendByteBuffer:(b, object)->
        v.required object
        b.writeVarint32 object.length
        for o in object
            st_operation.appendByteBuffer b, o
        return
    fromObject:(object)->
        v.required object
        for o in object
            st_operation.fromObject o
    toObject:(object, debug = {})->
        if debug.use_default and object is undefined
            return [ st_operation.toObject(object, debug) ]
        v.required object
        for o in object
            st_operation.toObject o, debug

Types.time_point_sec =
    fromByteBuffer:(b)-> b.readUint32()
    appendByteBuffer:(b, object)->
        b.writeUint32 object
        return
    fromObject:(object)->
        v.required object
        Math.round( (new Date(object)).getTime() / 1000 )
    toObject:(object, debug = {})->
        if debug.use_default and object is undefined
            return (new Date(0)).toISOString().split('.')[0]
        v.required object
        int = parseInt object
        v.require_range 0,0xFFFFFFFF,int, "uint32 #{object}"
        (new Date(int*1000)).toISOString().split('.')[0]

Types.set = (st_operation)->
    validate: (array)->
        dup_map = {}
        for o in array
            if typeof o in ['string', 'number']
                if dup_map[o] isnt undefined
                    throw new Error "duplicate"
                dup_map[o] = on
        array.sort(st_operation.compare)
    fromByteBuffer:(b)->
        size = b.readVarint32()
        if config.hex_dump
            console.log "varint32 size = " + size.toString(16)
        @validate (for i in [0...size] by 1
            st_operation.fromByteBuffer b)
    appendByteBuffer:(b, object)->
        object = [] unless object
        b.writeVarint32 object.length
        for o in @validate object
            st_operation.appendByteBuffer b, o
        return
    fromObject:(object)->
        object = [] unless object
        @validate (for o in object
            st_operation.fromObject o)
    toObject:(object, debug = {})->
        if debug.use_default and object is undefined
            return [ st_operation.toObject(object, debug) ]
        object = [] unless object
        @validate (for o in object
            st_operation.toObject o, debug)

# global_parameters_update_operation current_fees
Types.fixed_array = (count, st_operation)->
    fromByteBuffer:(b)->
        for i in [0...count] by 1
            st_operation.fromByteBuffer b
    appendByteBuffer:(b, object)->
        v.required object unless count is 0
        for i in [0...count] by 1
            st_operation.appendByteBuffer b, object[i]
        return
    fromObject:(object)->
        v.required object unless count is 0
        for i in [0...count] by 1
            st_operation.fromObject object[i]
    toObject:(object, debug = {})->
        return if debug.use_default and object is undefined
            for i in [0...count] by 1
                st_operation.toObject undefined, debug
        v.required object unless count is 0
        for i in [0...count] by 1
            st_operation.toObject object[i], debug

### Supports instance numbers (11) or object types (1.2.11).  Object type
validation is enforced when an object type is used. ###
id_type = (reserved_spaces, object_type)->
    v.required reserved_spaces, "reserved_spaces"
    v.required object_type, "object_type"
    fromByteBuffer:(b)->
        b.readVarint32()
    appendByteBuffer:(b, object)->
        v.required object
        object = object.resolve if object.resolve isnt undefined
        # convert 1.2.n into just n
        if /^[0-9]+\.[0-9]+\.[0-9]+$/.test object
            object = v.get_instance reserved_spaces, object_type, object
        b.writeVarint32 object
        return
    fromObject:(object)->
        v.required object
        object = object.resolve if object.resolve isnt undefined
        if v.is_digits object
            return v.to_number object
        v.get_instance reserved_spaces, object_type, object
    toObject:(object, debug = {})->
        object_type_id = chain_types.object_type[object_type]
        if debug.use_default and object is undefined
            return "#{reserved_spaces}.#{object_type_id}.0"
        v.required object
        object = object.resolve if object.resolve isnt undefined
        if /^[0-9]+\.[0-9]+\.[0-9]+$/.test object
            object = v.get_instance reserved_spaces, object_type, object
        
        "#{reserved_spaces}.#{object_type_id}."+object
    compare: (a, b) ->
        if(Array.isArray(a) && Array.isArray(b) && a.length > 0 && b.length > 0)
            return a[0] - b[0]
        else
            return 0

Types.protocol_id_type = (name)->
    id_type chain_types.reserved_spaces.protocol_ids, name

Types.object_id_type = 
    fromByteBuffer:(b)->
        ObjectId.fromByteBuffer b
    appendByteBuffer:(b, object)->
        v.required object
        object = object.resolve if object.resolve isnt undefined
        object = ObjectId.fromString object
        object.appendByteBuffer b
        return
    fromObject:(object)->
        v.required object
        object = object.resolve if object.resolve isnt undefined
        ObjectId.fromString object
    toObject:(object, debug = {})->
        if debug.use_default and object is undefined
            return "0.0.0"
        v.required object
        if object.resolve isnt undefined
            object = object.resolve
        object = ObjectId.fromString object
        object.toString()

Types.vote_id =
    TYPE: 0x000000FF
    ID:   0xFFFFFF00
    fromByteBuffer:(b)->
        value = b.readUint32()
        type: value & @TYPE
        id: value & @ID
    appendByteBuffer:(b, object)->
        v.required object
        value = object.id << 8 | object.type
        b.writeUint32 value
        return
    fromObject:(object)->
        v.required object, "(type vote_id)"
        v.require_test /^[0-9]+:[0-9]+$/, object, "vote_id format #{object}" 
        [type, id] = object.split ':'
        v.require_range 0,0xff,type,"vote type #{object}"
        v.require_range 0,0xffffff,id,"vote id #{object}"
        type:type
        id:id
    toObject:(object, debug = {})->
        if debug.use_default and object is undefined
            return "0:0"
        v.required object
        object.type + ":" + object.id
    compare: (a, b) ->
        parseInt(a.id) - parseInt(b.id)

Types.optional = (st_operation)->
    v.required st_operation, "st_operation"
    fromByteBuffer:(b)->
        unless b.readUint8() is 1
            return undefined
        st_operation.fromByteBuffer b
    appendByteBuffer:(b, object)->
        if object isnt null and object isnt undefined
            b.writeUint8 1
            st_operation.appendByteBuffer b, object
        else
            b.writeUint8 0
        return
    fromObject:(object)->
        return undefined if object is undefined
        st_operation.fromObject object
    toObject:(object, debug = {})->
        # toObject is only null save if use_default is true
        result_object = if not debug.use_default and object is undefined
            undefined
        else
            st_operation.toObject object, debug
        
        if debug.annotate
            if typeof result_object is "object"
                result_object.__optional = "parent is optional"
            else
                result_object = __optional: result_object
        result_object

Types.static_variant = (_st_operations)->
    st_operations: _st_operations
    fromByteBuffer:(b)->
        type_id = b.readVarint32()
        st_operation = @st_operations[type_id]
        if config.hex_dump
            console.error("static_variant id 0x#{type_id.toString(16)} (#{type_id})")
        v.required st_operation, "operation #{type_id}"
        [
            type_id
            st_operation.fromByteBuffer b
        ]
    appendByteBuffer:(b, object)->
        v.required object
        type_id = object[0]
        st_operation = @st_operations[type_id]
        v.required st_operation, "operation #{type_id}"
        b.writeVarint32 type_id
        st_operation.appendByteBuffer b, object[1]
        return
    fromObject:(object)->
        v.required object
        type_id = object[0]
        st_operation = @st_operations[type_id]
        v.required st_operation, "operation #{type_id}"
        [
            type_id
            st_operation.fromObject object[1]
        ]
    toObject:(object, debug = {})->
        if debug.use_default and object is undefined
            return [0, @st_operations[0].toObject(undefined, debug)]
        v.required object
        type_id = object[0]
        st_operation = @st_operations[type_id]
        v.required st_operation, "operation #{type_id}"
        [
            type_id
            st_operation.toObject object[1], debug
        ]

Types.map = (key_st_operation, value_st_operation)->
    validate:(array)->
        unless Array.isArray array
            throw new Error "expecting array"
        dup_map = {}
        for o in array
            unless o.length is 2
                throw new Error "expecting two elements"
            if typeof o[0] in ['number', 'string']
                if dup_map[o[0]] isnt undefined
                    throw new Error "duplicate"
                dup_map[o[0]] = on
        if key_st_operation.compare
            array.sort(key_st_operation.compare)
        else
            array
    
    fromByteBuffer:(b)->
        @validate (for i in [0...b.readVarint32()] by 1
            [
                key_st_operation.fromByteBuffer b
                value_st_operation.fromByteBuffer b
            ])
        
    appendByteBuffer:(b, object)->
        @validate object
        b.writeVarint32 object.length
        for o in object
            key_st_operation.appendByteBuffer b, o[0]
            value_st_operation.appendByteBuffer b, o[1]
        return
    fromObject:(object)->
        v.required object
        @validate (for o in object
            [
                key_st_operation.fromObject o[0]
                value_st_operation.fromObject o[1]
            ])
    toObject:(object, debug = {})->
        if debug.use_default and object is undefined
            return [
                [
                    key_st_operation.toObject(undefined, debug)
                    value_st_operation.toObject(undefined, debug)
                ]
            ]
        v.required object
        @validate (for o in object
            [
                key_st_operation.toObject o[0], debug
                value_st_operation.toObject o[1], debug
            ])

Types.public_key =
    _to_public:(object)->
        object = object.resolve if object.resolve isnt undefined
        return object if object.Q
        PublicKey.fromPublicKeyString object
    fromByteBuffer:(b)->
        fp.public_key b
    appendByteBuffer:(b, object)->
        v.required object
        fp.public_key b, Types.public_key._to_public object
        return
    fromObject:(object)->
        v.required object
        return object if object.Q
        PublicKey.fromPublicKeyString object
    toObject:(object, debug = {})->
        if debug.use_default and object is undefined
            return "BTSXyz...public_key"
        v.required object
        Types.public_key._to_public(object).toPublicKeyString()

Types.address =
    _to_address:(object)->
        v.required object
        return object if object.addy
        Address.fromString(object)
    fromByteBuffer:(b)->
        new Address(fp.ripemd160 b)
    appendByteBuffer:(b, object)->
        fp.ripemd160 b, Types.address._to_address(object).toBuffer()
        return
    fromObject:(object)->
        Types.address._to_address(object)
    toObject:(object, debug = {})->
        if debug.use_default and object is undefined
            return "BTSXyz...address"
        Types.address._to_address(object).toString()
